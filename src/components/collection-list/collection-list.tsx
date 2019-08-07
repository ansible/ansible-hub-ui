import * as React from 'react';
import './list.scss';

import { DataList } from '@patternfly/react-core';

import { CollectionListType } from '../../api';
import { CollectionListItem, Sort, Toolbar } from '../../components';
import { Constants } from '../../constants';
import { ParamHelper } from '../../utilities/param-helper';

import { Pagination, TextInput } from '@patternfly/react-core';

interface IProps {
    collections: CollectionListType[];
    params: {
        sort?: string;
        page?: number;
        page_size?: number;
    };
    updateParams: (params) => void;
    itemCount: number;

    showNamespace?: boolean;
    controls?: React.ReactNode;
}

interface IState {
    kwField: string;
}

export class CollectionList extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = { kwField: props.params['keywords'] || '' };
    }

    render() {
        const { collections, params, updateParams } = this.props;

        return (
            <React.Fragment>
                <div className='controls top'>
                    <Toolbar
                        searchPlaceholder='Find collection by name'
                        sortOptions={[
                            { title: 'Name', id: 'name' },
                            {
                                title: 'Last Updated',
                                id: 'created',
                            },
                        ]}
                        updateParams={updateParams}
                        params={params}
                    />

                    <div>
                        {this.renderPagination('pagination-options-menu-top')}
                    </div>
                </div>

                <DataList aria-label={'List of Collections'}>
                    {collections.map(c => (
                        <CollectionListItem key={c.id} {...c} />
                    ))}
                </DataList>

                <div className='controls bottom'>
                    <div></div>
                    <div>{this.renderPagination()}</div>
                </div>
            </React.Fragment>
        );
    }

    private handleEnter(e) {
        if (e.key === 'Enter') {
            this.props.updateParams(
                ParamHelper.setParam(
                    this.props.params,
                    'keywords',
                    this.state.kwField,
                ),
            );
        }
    }

    private renderPagination(widgetId?) {
        const { params, updateParams, itemCount } = this.props;

        return (
            <Pagination
                itemCount={itemCount}
                perPage={params.page_size || Constants.DEFAULT_PAGE_SIZE}
                page={params.page || 1}
                widgetId={widgetId}
                onSetPage={(_, p) =>
                    updateParams(ParamHelper.setParam(params, 'page', p))
                }
                onPerPageSelect={(_, p) => {
                    updateParams({ ...params, page: 1, page_size: p });
                }}
            />
        );
    }
}
