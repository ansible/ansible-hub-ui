import * as React from 'react';
import './search.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  DataList,
  EmptyState,
  EmptyStateIcon,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  EmptyStateBody,
  EmptyStateVariant,
  Button,
  ToolbarContent,
  Switch,
} from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';

import {
  BaseHeader,
  CollectionCard,
  CardListSwitcher,
  CollectionListItem,
  CompoundFilter,
  Pagination,
  LoadingPageSpinner,
  AppliedFilters,
} from '../../components';
import {
  CollectionAPI,
  CollectionListType,
  CertificationStatus,
  SyncListType,
  MySyncListAPI,
} from '../../api';
import { ParamHelper } from '../../utilities/param-helper';
import { Constants } from '../../constants';

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

    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE)
      this.getSynclist();
  }

  render() {
    const { collections, params, numberOfResults } = this.state;

    const tags = [
      'cloud',
      'linux',
      'networking',
      'storage',
      'security',
      'windows',
      'infrastructure',
      'monitoring',
      'tools',
      'database',
      'application',
    ];

    return (
      <div className='search-page'>
        <BaseHeader className='header' title='Collections'>
          <div className='toolbar-wrapper'>
            <div className='toolbar'>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <CompoundFilter
                        updateParams={p =>
                          this.updateParams(p, () => this.queryCollections())
                        }
                        params={params}
                        filterConfig={[
                          {
                            id: 'keywords',
                            title: 'Keywords',
                          },
                          {
                            id: 'tags',
                            title: 'Tag',
                            inputType: 'multiple',
                            options: tags.map(tag => ({
                              id: tag,
                              title: tag,
                            })),
                          },
                        ]}
                      />
                      <ToolbarItem>
                        <AppliedFilters
                          style={{ marginTop: '16px' }}
                          updateParams={p =>
                            this.updateParams(p, () => this.queryCollections())
                          }
                          params={params}
                          ignoredParams={[
                            'page_size',
                            'page',
                            'sort',
                            'view_type',
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>

              <div className='pagination-container'>
                <div className='card-list-switcher'>
                  <CardListSwitcher
                    size='sm'
                    params={params}
                    updateParams={p =>
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
                  updateParams={p =>
                    this.updateParams(p, () => this.queryCollections())
                  }
                  count={numberOfResults}
                  perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                  isTop
                />
              </div>
            </div>
          </div>
        </BaseHeader>
        <Section className='collection-container'>
          {this.renderCollections(collections, params)}
        </Section>
        <Section className='footer'>
          <Pagination
            params={params}
            updateParams={p =>
              this.updateParams(p, () => this.queryCollections())
            }
            perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
            count={numberOfResults}
          />
        </Section>
      </div>
    );
  }

  private renderCollections(collections, params) {
    if (this.state.loading) {
      return <LoadingPageSpinner></LoadingPageSpinner>;
    }
    if (collections.length === 0) {
      return this.renderEmpty();
    }
    if (params.view_type === 'list') {
      return this.renderList(collections);
    } else {
      return this.renderCards(collections);
    }
  }

  private renderEmpty() {
    return (
      <EmptyState className='empty' variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel='h2' size='lg'>
          No results found
        </Title>
        <EmptyStateBody>
          No results match the search criteria. Remove all filters to show
          results.
        </EmptyStateBody>
        <Button
          variant='link'
          onClick={() => this.updateParams({}, () => this.queryCollections())}
        >
          Clear search
        </Button>
      </EmptyState>
    );
  }

  private renderCards(collections) {
    return (
      <div className='cards'>
        {collections.map(c => {
          return (
            <CollectionCard
              className='card'
              key={c.id}
              {...c}
              footer={this.renderSyncToggle(c.name, c.namespace.name)}
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
        label='Sync'
        isChecked={this.isCollectionSynced(name, namespace)}
        onChange={() => this.toggleCollectionSync(name, namespace)}
      />
    );
  }

  private toggleCollectionSync(name: string, namespace: string) {
    const synclist = { ...this.state.synclist };

    const colIndex = synclist.collections.findIndex(
      el => el.name === name && el.namespace === namespace,
    );

    if (colIndex < 0) {
      synclist.collections.push({ name: name, namespace: namespace });
    } else {
      synclist.collections.splice(colIndex, 1);
    }

    MySyncListAPI.update(synclist.id, synclist).then(response => {
      this.setState({ synclist: response.data });
      MySyncListAPI.curate(synclist.id).then(() => null);
    });
  }

  private isCollectionSynced(name: string, namespace: string): boolean {
    const { synclist } = this.state;
    const found = synclist.collections.find(
      el => el.name === name && el.namespace === namespace,
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
          <DataList className='data-list' aria-label={'List of Collections'}>
            {collections.map(c => (
              <CollectionListItem
                showNamespace={true}
                key={c.id}
                {...c}
                controls={this.renderSyncToggle(c.name, c.namespace.name)}
              />
            ))}
          </DataList>
        </div>
      </div>
    );
  }

  private getSynclist() {
    MySyncListAPI.list().then(result => {
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
      CollectionAPI.list({
        ...ParamHelper.getReduced(this.state.params, ['view_type']),
        deprecated: false,
        certification: CertificationStatus.certified,
      }).then(result => {
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
