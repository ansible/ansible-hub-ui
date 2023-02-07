import { t } from '@lingui/macro';
import { DataList, Switch } from '@patternfly/react-core';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CollectionAPI, CollectionListType } from 'src/api';
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
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { Paths } from 'src/paths';
import { filterIsSet } from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
import './search.scss';

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
    };
  }

  componentDidMount() {
    this.queryCollections();
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
              repo={this.context.selectedRepo}
            />
          );
        })}
      </div>
    );
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
                repo={this.context.selectedRepo}
              />
            ))}
          </DataList>
        </div>
      </div>
    );
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
