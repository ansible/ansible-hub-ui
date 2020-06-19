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
  Main,
  Sort,
  SortFieldType,
  AppliedFilters,
} from '../../components';
import {
  CollectionAPI,
  CollectionListType,
  CertificationStatus,
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
    const { collections, params, numberOfResults, loading } = this.state;

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
      <React.Fragment>
        <BaseHeader className='header' title='Collections'>
          <div className='toolbar-wrapper'>
            <div className='toolbar'>
              <Toolbar>
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
                  </ToolbarItem>
                </ToolbarGroup>
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
            <div className='applied-filters'>
              <AppliedFilters
                updateParams={p =>
                  this.updateParams(p, () => this.queryCollections())
                }
                params={params}
                ignoredParams={['page_size', 'page', 'sort', 'view_type']}
              />
            </div>
          </div>
        </BaseHeader>
        <Main>
          <Section className='collection-container'>
            {this.renderCollections(collections, params)}
          </Section>
          <Section className='body footer'>
            <Pagination
              params={params}
              updateParams={p =>
                this.updateParams(p, () => this.queryCollections())
              }
              perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
              count={numberOfResults}
            />
          </Section>
        </Main>
      </React.Fragment>
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
          return <CollectionCard className='card' key={c.id} {...c} />;
        })}
      </div>
    );
  }

  private renderList(collections) {
    return (
      <div className='list-container'>
        <div className='list'>
          <DataList className='data-list' aria-label={'List of Collections'}>
            {collections.map(c => (
              <CollectionListItem showNamespace={true} key={c.id} {...c} />
            ))}
          </DataList>
        </div>
      </div>
    );
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
