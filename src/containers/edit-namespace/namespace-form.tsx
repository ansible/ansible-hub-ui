import * as React from 'react';

import {
    Main,
    Section,
    Spinner,
} from '@redhat-cloud-services/frontend-components';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { PartnerHeader, NamespaceForm, ResourcesForm } from '../../components';
import { NamespaceAPI, NamespaceType } from '../../api';

import { Form, ActionGroup, Button } from '@patternfly/react-core';

import { Paths, formatPath } from '../../paths';
import { ParamHelper } from '../../utilities/param-helper';

interface IState {
    namespace: NamespaceType;
    newLinkName: string;
    newLinkURL: string;
    errorMessages: any;
    saving: boolean;
    redirect: string;
    unsavedData: boolean;
    params: {
        tab?: string;
    };
}

class EditNamespace extends React.Component<RouteComponentProps, IState> {
    queryParams: URLSearchParams;

    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search);

        if (!params['tab']) {
            params['tab'] = 'edit details';
        }

        this.state = {
            namespace: null,
            newLinkURL: '',
            newLinkName: '',
            errorMessages: {},
            saving: false,
            redirect: null,
            unsavedData: false,
            params: params,
        };
    }

    componentDidMount() {
        this.loadNamespace();
    }

    render() {
        const {
            namespace,
            errorMessages,
            saving,
            redirect,
            params,
        } = this.state;

        if (redirect) {
            return <Redirect to={redirect} />;
        }

        if (!namespace) {
            return null;
        }
        return (
            <React.Fragment>
                <PartnerHeader
                    namespace={namespace}
                    breadcrumbs={[
                        { name: 'My namespaces', url: Paths.myNamespaces },
                        {
                            name: namespace.name,
                            url: formatPath(Paths.myCollections, {
                                namespace: namespace.name,
                            }),
                        },
                        { name: 'Edit' },
                    ]}
                    tabs={['Edit details', 'Edit resources']}
                    params={params}
                    updateParams={p => this.updateParams(p)}
                ></PartnerHeader>
                <Main>
                    <Section className='body'>
                        {params.tab.toLowerCase() === 'edit details' ? (
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

                                {saving ? <Spinner></Spinner> : null}
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

    get updateParams() {
        return ParamHelper.updateParamsMixin();
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

    private saveNamespace() {
        this.setState({ saving: true }, () => {
            NamespaceAPI.update(this.state.namespace.name, this.state.namespace)
                .then(result => {
                    this.setState({
                        namespace: result.data,
                        errorMessages: {},
                        saving: false,
                        unsavedData: false,
                        redirect: formatPath(Paths.myCollections, {
                            namespace: this.state.namespace.name,
                        }),
                    });
                })
                .catch(error => {
                    const result = error.response;
                    if (result.status === 400) {
                        const messages: any = {};
                        for (const e of result.data.errors) {
                            messages[e.source.parameter] = e.detail;
                        }

                        this.setState({
                            errorMessages: messages,
                            saving: false,
                        });
                    }
                });
        });
    }

    private cancel() {
        this.setState({
            redirect: formatPath(Paths.myCollections, {
                namespace: this.state.namespace.name,
            }),
        });
    }

    private validateNamesace(namespace) {
        // TODO: add data validation once error format and validation checks
        // are known
    }
}

export default withRouter(EditNamespace);
