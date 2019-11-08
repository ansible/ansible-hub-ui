import * as React from 'react';
import './list.scss';

import {
    TextInput,
    Button,
    DropdownItem,
    DataList,
    EmptyState,
    EmptyStateIcon,
    Title,
    EmptyStateVariant,
    EmptyStateBody,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';

import { CollectionListType } from '../../api';
import {
    CollectionListItem,
    Toolbar,
    Pagination,
    StatefulDropdown,
} from '../../components';
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
    showControls?: boolean;
    handleControlClick?: (id, event) => void;
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
        const {
            collections,
            params,
            updateParams,
            itemCount,
            showControls,
        } = this.props;

        return (
            <React.Fragment>
                <div className='controls top'>
                    <Toolbar
                        searchPlaceholder='Find collection by name'
                        sortOptions={[
                            { title: 'Name', id: 'name' },
                            {
                                title: 'Last updated',
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
                    {collections.length > 0 ? (
                        collections.map(c => (
                            <CollectionListItem
                                controls={
                                    showControls
                                        ? this.renderCollectionControls(c.id)
                                        : null
                                }
                                key={c.id}
                                {...c}
                            />
                        ))
                    ) : (
                        <EmptyState
                            className='empty'
                            variant={EmptyStateVariant.full}
                        >
                            <EmptyStateIcon icon={WarningTriangleIcon} />
                            <Title headingLevel='h2' size='lg'>
                                No collections found
                            </Title>
                            <EmptyStateBody>
                                Please try adjusting your search query.
                            </EmptyStateBody>
                        </EmptyState>
                    )}
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

    private renderCollectionControls(id) {
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    onClick={() => this.props.handleControlClick(id, 'upload')}
                    variant='secondary'
                >
                    Upload new version
                </Button>
                <StatefulDropdown
                    items={[
                        <DropdownItem
                            onClick={e =>
                                this.props.handleControlClick(id, 'deprecate')
                            }
                            key='1'
                        >
                            Deprecate
                        </DropdownItem>,
                    ]}
                />
            </div>
        );
    }
}
