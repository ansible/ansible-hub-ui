import * as React from 'react';
import './search.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import {
    DataList,
    EmptyState,
    EmptyStateIcon,
    Title,
    EmptyStateBody,
    EmptyStateVariant,
} from '@patternfly/react-core';

import { WarningTriangleIcon } from '@patternfly/react-icons';

import {
    BaseHeader,
    CollectionCard,
    Toolbar,
    TagFilter,
    CardListSwitcher,
    CollectionListItem,
    Pagination,
    LoadingPageSpinner,
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
        tags?: string;
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

        this.tags = [
            'cloud',
            'linux',
            'network',
            'storage',
            'security',
            'windows',
            'infrastructure',
            'monitoring',
            'tools',
            'database',
            'application',
        ];
    }

    componentDidMount() {
        this.queryCollections();
    }

    render() {
        const { collections, params, numberOfResults, loading } = this.state;

        return (
            <React.Fragment>
                <BaseHeader
                    className='header'
                    title='Collections'
                    pageControls={
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
                    }
                >
                    <div className='toolbar'>
                        <Toolbar
                            params={params}
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.queryCollections(),
                                )
                            }
                            searchPlaceholder='Search collections'
                        />

                        <Pagination
                            params={params}
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.queryCollections(),
                                )
                            }
                            count={numberOfResults}
                            isTop
                        />
                    </div>
                </BaseHeader>
                <Main>
                    <Section className='collection-container'>
                        <div className='sidebar'>
                            <TagFilter
                                params={params}
                                updateParams={p =>
                                    this.updateParams(p, () =>
                                        this.queryCollections(),
                                    )
                                }
                                tags={this.tags}
                            />
                        </div>

                        {this.renderCollections(collections, params)}
                    </Section>
                    <Section className='body footer'>
                        <Pagination
                            params={params}
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.queryCollections(),
                                )
                            }
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
                <EmptyStateIcon icon={WarningTriangleIcon} />
                <Title headingLevel='h2' size='lg'>
                    No matches
                </Title>
                <EmptyStateBody>
                    Please try adjusting your search query
                </EmptyStateBody>
            </EmptyState>
        );
    }

    private renderCards(collections) {
        return (
            <div className='cards'>
                {collections.map(c => {
                    return (
                        <CollectionCard className='card' key={c.id} {...c} />
                    );
                })}
            </div>
        );
    }

    private renderList(collections) {
        return (
            <div className='list-container'>
                <div className='body list'>
                    <DataList
                        className='data-list'
                        aria-label={'List of Collections'}
                    >
                        {collections.map(c => (
                            <CollectionListItem
                                showNamespace={true}
                                key={c.id}
                                {...c}
                            />
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
