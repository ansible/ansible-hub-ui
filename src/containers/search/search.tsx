import { t } from '@lingui/macro';
import * as React from 'react';
import './search.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { DataList, Switch } from '@patternfly/react-core';
import {
  BaseHeader,
  CardListSwitcher,
  CollectionCard,
  CollectionFilter,
  CollectionListItem,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Pagination,
  RepoSelector,
} from 'src/components';
import {
  CollectionAPI,
  CollectionListType,
  SyncListType,
  MySyncListAPI,
} from 'src/api';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { filterIsSet } from 'src/utilities';
import { Paths } from 'src/paths';

interface IState {
  collections: CollectionListType[];
  numberOfResults: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
  };
  loading: boolean;
  synclist: SyncListType;
}

class Search extends React.Component<RouteComponentProps, IState> {
  tags: string[];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = Constants.CARD_DEFAULT_PAGE_SIZE;
    }

    // Load view type from local storage if it's not set. This allows a
    // user's view type preference to persist
    if (!params['view_type']) {
      params['view_type'] = localStorage.getItem(
        Constants.SEARCH_VIEW_TYPE_LOCAL_KEY,
      );
    }

    this.state = {
      collections: [],
      params: params,
      numberOfResults: 0,
      loading: true,
      synclist: undefined,
    };
  }

  componentDidMount() {
    this.queryCollections();

    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      this.getSynclist();
    }
  }

  render() {
    const { loading, collections, params, numberOfResults } = this.state;
    const noData =
      collections.length === 0 && !filterIsSet(params, ['keywords', 'tags']);

    const updateParams = (p) =>
      this.updateParams(p, () => this.queryCollections());

    return (
      <div className='search-page'>
        <BaseHeader
          className='header'
          title={t`Collections`}
          contextSelector={
            <RepoSelector
              selectedRepo={this.context.selectedRepo}
              path={Paths.searchByRepo}
            />
          }
        >
          {!noData && (
            <div className='toolbar-wrapper'>
              <div className='toolbar'>
                <CollectionFilter
                  ignoredParams={['page', 'page_size', 'sort', 'view_type']}
                  params={params}
                  updateParams={updateParams}
                />

                <div className='pagination-container'>
                  <div className='card-list-switcher'>
                    <CardListSwitcher
                      size='sm'
                      params={params}
                      updateParams={(p) =>
                        this.updateParams(p, () =>
                          // Note, we have to use this.state.params instead
                          // of params in the callback because the callback
                          // executes before the page can re-run render
                          // which means params doesn't contain the most
                          // up to date state
                          localStorage.setItem(
                            Constants.SEARCH_VIEW_TYPE_LOCAL_KEY,
                            this.state.params.view_type,
                          ),
                        )
                      }
                    />
                  </div>

                  <Pagination
                    params={params}
                    updateParams={updateParams}
                    count={numberOfResults}
                    perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                    isTop
                  />
                </div>
              </div>
            </div>
          )}
        </BaseHeader>
        {loading ? (
          <LoadingPageSpinner />
        ) : noData ? (
          <EmptyStateNoData
            title={t`No collections yet`}
            description={t`Collections will appear once uploaded`}
          />
        ) : (
          <React.Fragment>
            <section className='collection-container'>
              {this.renderCollections(collections, params, updateParams)}
            </section>
            <section className='footer'>
              <Pagination
                params={params}
                updateParams={(p) =>
                  this.updateParams(p, () => this.queryCollections())
                }
                perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                count={numberOfResults}
              />
            </section>
          </React.Fragment>
        )}
      </div>
    );
  }

  private renderCollections(collections, params, updateParams) {
    if (collections.length === 0) {
      return (
        <EmptyStateFilter
          clearAllFilters={() => {
            ParamHelper.clearAllFilters({
              params,
              ignoredParams: ['page', 'page_size', 'sort', 'view_type'],
              updateParams,
            });
          }}
        />
      );
    }
    if (params.view_type === 'list') {
      return this.renderList(collections);
    } else {
      return this.renderCards(collections);
    }
  }

  private renderCards(collections) {
    return (
      <div className='cards'>
        {collections.map((c) => {
          return (
            <CollectionCard
              className='card'
              key={c.id}
              {...c}
              footer={this.renderSyncToggle(c.name, c.namespace.name)}
              repo={this.context.selectedRepo}
            />
          );
        })}
      </div>
    );
  }

  private renderSyncToggle(name: string, namespace: string): React.ReactNode {
    const { synclist } = this.state;
    if (!synclist) {
      return null;
    }
    return (
      <Switch
        id={namespace + '.' + name}
        className='sync-toggle'
        label={t`Sync`}
        isChecked={this.isCollectionSynced(name, namespace)}
        onChange={() => this.toggleCollectionSync(name, namespace)}
      />
    );
  }

  private toggleCollectionSync(name: string, namespace: string) {
    const synclist = { ...this.state.synclist };

    const colIndex = synclist.collections.findIndex(
      (el) => el.name === name && el.namespace === namespace,
    );

    if (colIndex < 0) {
      synclist.collections.push({ name: name, namespace: namespace });
    } else {
      synclist.collections.splice(colIndex, 1);
    }

    MySyncListAPI.update(synclist.id, synclist).then((response) => {
      this.setState({ synclist: response.data });
      MySyncListAPI.curate(synclist.id).then(() => null);
    });
  }

  private isCollectionSynced(name: string, namespace: string): boolean {
    const { synclist } = this.state;
    const found = synclist.collections.find(
      (el) => el.name === name && el.namespace === namespace,
    );

    if (synclist.policy === 'include') {
      return !(found === undefined);
    } else {
      return found === undefined;
    }
  }

  private renderList(collections) {
    return (
      <div className='list-container'>
        <div className='list'>
          <DataList className='data-list' aria-label={t`List of Collections`}>
            {collections.map((c) => (
              <CollectionListItem
                showNamespace={true}
                key={c.id}
                {...c}
                controls={this.renderSyncToggle(c.name, c.namespace.name)}
                repo={this.context.selectedRepo}
              />
            ))}
          </DataList>
        </div>
      </div>
    );
  }

  private getSynclist() {
    MySyncListAPI.list().then((result) => {
      // ignore results if more than 1 is returned
      // TODO: should we throw an error for this or just ignore it?
      if (result.data.meta.count === 1) {
        this.setState({ synclist: result.data.data[0] });
      } else {
        console.error(
          `my-synclist returned ${result.data.meta.count} synclists`,
        );
      }
    });
  }

  private queryCollections() {
    this.setState({ loading: true }, () => {
      CollectionAPI.list(
        {
          ...ParamHelper.getReduced(this.state.params, ['view_type']),
          deprecated: false,
        },
        this.context.selectedRepo,
      ).then((result) => {
        this.setState({
          collections: result.data.data,
          numberOfResults: result.data.meta.count,
          loading: false,
        });
      });
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(Search);

Search.contextType = AppContext;
