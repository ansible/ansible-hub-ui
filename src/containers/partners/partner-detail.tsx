import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { BaseHeader } from '../../components/headers/base-header';
import { NotImplemented } from '../../components/not-implemented/not-implemented';

import { Main, Section } from '@redhat-cloud-services/frontend-components';

import {
    Button,
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListCheck,
    DataListAction,
    DataListToggle,
    DataListContent,
    Dropdown,
    KebabToggle,
    DropdownItem,
} from '@patternfly/react-core';

import { CollectionList } from '../../api/response-types/collection';
import { CollectionAPI } from '../../api/collection';
import { CollectionListItem } from '../../components/collection-list/collection-list-item';

interface IState {
    collections: CollectionList[];
}

class PartnerDetail extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
        super(props);
        this.state = { collections: [] };
    }

    componentDidMount() {
        CollectionAPI.list().then(result =>
            this.setState({ collections: result.data }),
        );
    }

    render() {
        const { collections } = this.state;
        return (
            <React.Fragment>
                <BaseHeader title='Partner Details' />
                <Main>
                    <Section className='body'>
                        <DataList
                            aria-label={
                                'List of Collections uploaded by ' +
                                this.props.match.params['namespace']
                            }
                        >
                            {collections.map(c => (
                                <CollectionListItem key={c.id} {...c} />
                            ))}
                        </DataList>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(PartnerDetail);
