import * as React from 'react';
import './search.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { DataList } from '@patternfly/react-core';

import {
    BaseHeader,
    CollectionCard,
    Toolbar,
    TagFilter,
    CardListSwitcher,
    CollectionListItem,
    Pagination,
} from '../../components';
import { CollectionAPI, CollectionListType } from '../../api';
import { ParamHelper } from '../../utilities/param-helper';

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
}

class Search extends React.Component<RouteComponentProps, IState> {
    tags: { name: string; quantity: number }[];

    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        this.state = {
            collections: [],
            params: params,
            numberOfResults: 0,
        };

        this.tags = [
            { name: 'network', quantity: 10 },
            { name: 'cloud', quantity: 99 },
            { name: 'package', quantity: 90102 },
            { name: 'security', quantity: 1 },
        ];
    }

    componentDidMount() {
        this.queryCollections();
    }

    render() {
        const { collections, params, numberOfResults } = this.state;
        return (
            <React.Fragment>
                <BaseHeader
                    pageControls={
                        <CardListSwitcher
                            params={params}
                            updateParams={p => this.updateParams(p)}
                        />
                    }
                    title='Collections'
                >
                    <div
                        style={{
                            marginBottom: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Toolbar
                            params={params}
                            sortOptions={[
                                { id: 'name', title: 'Name' },
                                { id: 'download_count', title: 'Downloads' },
                                { id: 'best_match', title: 'Best Match' },
                            ]}
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.queryCollections(),
                                )
                            }
                            searchPlaceholder='Search Collections'
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
                        {params.view_type === 'list'
                            ? this.renderList(collections)
                            : this.renderCards(collections)}
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

    private renderCards(collections) {
        return (
            <div className='cards'>
                {collections.map(c => {
                    return <CollectionCard key={c.id} {...c} />;
                })}
            </div>
        );
    }

    private renderList(collections) {
        return (
            <div className='body list'>
                <DataList aria-label={'List of Collections'}>
                    {collections.map(c => (
                        <CollectionListItem
                            showNamespace={true}
                            key={c.id}
                            {...c}
                        />
                    ))}
                </DataList>
            </div>
        );
    }

    private queryCollections() {
        CollectionAPI.list(
            ParamHelper.getReduced(this.state.params, ['view_type']),
        ).then(result => {
            this.setState({
                collections: result.data.data,
                numberOfResults: result.data.meta.count,
            });
        });
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin();
    }
}

export default withRouter(Search);
