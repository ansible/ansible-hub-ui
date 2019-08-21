import * as React from 'react';
import './list.scss';

import { DataList } from '@patternfly/react-core';

import { CollectionListType } from '../../api';
import {
    CollectionListItem,
    Sort,
    Toolbar,
    Pagination,
} from '../../components';
import { Constants } from '../../constants';
import { ParamHelper } from '../../utilities/param-helper';

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
        const { collections, params, updateParams, itemCount } = this.props;

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
                        <Pagination
                            params={params}
                            updateParams={p => updateParams(p)}
                            count={itemCount}
                            isTop
                        />
                    </div>
                </div>

                <DataList aria-label={'List of Collections'}>
                    {collections.map(c => (
                        <CollectionListItem key={c.id} {...c} />
                    ))}
                </DataList>

                <div className='controls bottom'>
                    <div></div>
                    <div>
                        <Pagination
                            params={params}
                            updateParams={p => updateParams(p)}
                            count={itemCount}
                        />
                    </div>
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
}
