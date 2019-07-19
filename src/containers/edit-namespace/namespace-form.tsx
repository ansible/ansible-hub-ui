import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import {
    Main,
    Section,
    Spinner,
} from '@redhat-cloud-services/frontend-components';

import {
    EditNamespaceHeader,
    TabKeys,
} from '../../components/headers/edit-namespace';
import { NamespaceForm } from '../../components/namespace-form/namespace-form';
import { ResourcesForm } from '../../components/namespace-form/resources-form';

import { NamespaceAPI } from '../../api/namespace';
import { Namespace } from '../../api/response-types/namespace';

import { Paths } from '../../paths';

interface IProps extends RouteComponentProps {}

import { Form, ActionGroup, Button, Alert } from '@patternfly/react-core';

interface IState {
    namespace: Namespace;
    newLinkName: string;
    newLinkURL: string;
    errorMessages: any;
    saving: boolean;
    redirect: string;
    tab: TabKeys;
    unsavedData: boolean;
}

class EditNamespace extends React.Component<IProps, IState> {
    queryParams: URLSearchParams;

    constructor(props) {
        super(props);

        this.queryParams = new URLSearchParams(props.location.search);

        this.state = {
            namespace: null,
            newLinkURL: '',
            newLinkName: '',
            errorMessages: {},
            saving: false,
            redirect: null,
            unsavedData: false,
            tab: parseInt(this.queryParams.get('tab')) || TabKeys.details,
        };
    }

    componentDidMount() {
        this.loadNamespace();
    }

    render() {
        const { namespace, errorMessages, saving, redirect, tab } = this.state;

        if (redirect) {
            return <Redirect to={redirect} />;
        }

        if (!namespace) {
            return null;
        }
        return (
            <React.Fragment>
                <EditNamespaceHeader
                    namespace={namespace}
                    activeTab={tab}
                    tabClick={key => this.updateTab(key)}
                ></EditNamespaceHeader>
                <Main>
                    <Section className='body'>
                        {tab === TabKeys.details ? (
                            <NamespaceForm
                                namespace={namespace}
                                errorMessages={errorMessages}
                                updateNamespace={namespace =>
                                    this.setState({
                                        namespace: namespace,
                                        unsavedData: true,
                                    })
                                }
                            />
                        ) : (
                            <ResourcesForm
                                updateNamespace={namespace =>
                                    this.setState({
                                        namespace: namespace,
                                        unsavedData: true,
                                    })
                                }
                                namespace={namespace}
                            />
                        )}
                        <Form>
                            <ActionGroup>
                                <Button
                                    variant='primary'
                                    onClick={() => this.saveNamespace()}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant='secondary'
                                    onClick={() => this.cancel()}
                                >
                                    Cancel
                                </Button>

                                {this.state.saving ? <Spinner></Spinner> : null}
                            </ActionGroup>
                            {this.state.unsavedData ? (
                                <div style={{ color: 'red' }}>
                                    You have unsaved changes
                                </div>
                            ) : null}
                        </Form>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    private loadNamespace() {
        NamespaceAPI.get(this.props.match.params['namespace'])
            .then(response => {
                this.setState({ namespace: response.data });
            })
            .catch(response => {
                this.setState({ redirect: Paths.notFound });
            });
    }

    private updateTab(key: TabKeys) {
        this.queryParams.set('tab', key.toString());

        this.props.history.push({
            pathname: this.props.location.pathname,
            search: '?' + this.queryParams.toString(),
        });

        this.setState({ tab: key });
    }

    private saveNamespace() {
        this.setState({ saving: true }, () => {
            NamespaceAPI.update(this.state.namespace.name, this.state.namespace)
                .then(result => {
                    this.setState({
                        namespace: result.data,
                        errorMessages: {},
                        saving: false,
                        unsavedData: false,
                    });
                })
                .catch(result => {
                    this.setState({
                        errorMessages: result.data,
                        saving: false,
                    });
                });
        });
    }

    private cancel() {
        this.setState({ unsavedData: false }, () => this.loadNamespace());
    }

    private validateNamesace(namespace) {
        // TODO: add data validation once error format and validation checks
        // are known
    }
}

export default withRouter(EditNamespace);
