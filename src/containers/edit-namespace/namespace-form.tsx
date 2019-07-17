import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import './sample-page.scss';

import {
    Section,
    Main,
    PageHeader,
    PageHeaderTitle,
    Spinner,
} from '@redhat-cloud-services/frontend-components';

import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Tab,
    Tabs,
} from '@patternfly/react-core';

import { EditNamespaceHeader } from '../../components/headers/edit-namespace';
import { NamespaceCard } from '../../components/cards/namespace-card';

import { NamespaceAPI } from '../../api/namespace';
import { Namespace } from '../../api/response-types/namespace';

interface IProps extends RouteComponentProps {}

interface IState {
    namespace: Namespace;
}

class EditNamespace extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            namespace: null,
        };
    }

    componentDidMount() {
        NamespaceAPI.get(this.props.match.params['namespace']).then(
            response => {
                this.setState({ namespace: response.data });
            },
        );
    }

    render() {
        const { namespace } = this.state;

        if (!namespace) {
            return null;
        }
        return (
            <React.Fragment>
                <EditNamespaceHeader
                    namespace={namespace}
                ></EditNamespaceHeader>
                <Main>
                    <NamespaceCard
                        avatarURL={namespace.avatar_url}
                        company={namespace.company}
                        numCollections={namespace.num_collections}
                        name={namespace.name}
                    />
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(EditNamespace);
