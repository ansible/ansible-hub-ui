import * as React from 'react';
import './list.scss';

import { DataList } from '@patternfly/react-core';

import { CollectionList as CollectionListType } from '../../api/response-types/collection';

import { CollectionListItem } from '../../components/collection-list/collection-list-item';
import { Sort } from '../patternfly-wrappers/sort';

import {
    Toolbar,
    ToolbarGroup,
    ToolbarItem,
    Pagination,
    TextInput,
} from '@patternfly/react-core';

interface IProps {
    collections: CollectionListType[];
    params: any;
    updateParams: (params) => void;
    itemCount: number;

    showNamespace?: boolean;
    controls?: React.ReactNode;
}

export class CollectionList extends React.Component<IProps, {}> {
    render() {
        const { collections, params, updateParams, itemCount } = this.props;

        return (
            <React.Fragment>
                <div className='controls top'>
                    <Toolbar>
                        <ToolbarGroup>
                            <ToolbarItem>
                                <TextInput
                                    value=''
                                    type='search'
                                    aria-label='search text input'
                                    placeholder='Find collection by name'
                                />
                            </ToolbarItem>
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <ToolbarItem>
                                <Sort
                                    options={[
                                        { title: 'Name', id: 'name' },
                                        {
                                            title: 'Last Updated',
                                            id: 'created',
                                        },
                                    ]}
                                    params={params}
                                    updateParams={updateParams}
                                />
                            </ToolbarItem>
                        </ToolbarGroup>
                    </Toolbar>

                    <div>
                        <Pagination
                            itemCount={itemCount}
                            perPage={10}
                            page={1}
                            widgetId='pagination-options-menu-top'
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
                            itemCount={itemCount}
                            perPage={10}
                            page={1}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
