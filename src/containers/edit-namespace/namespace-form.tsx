import * as React from 'react';

import { Section, Spinner } from '@redhat-cloud-services/frontend-components';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import {
    PartnerHeader,
    NamespaceForm,
    ResourcesForm,
    AlertList,
    closeAlertMixin,
    AlertType,
    Main,
} from '../../components';
import { MyNamespaceAPI, NamespaceType, UserAPI } from '../../api';
import { Constants } from '../../constants';

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
    alerts: AlertType[];
    params: {
        tab?: string;
    };
    userId: string;
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
            alerts: [],
            namespace: null,
            userId: '',
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
        UserAPI.getUser().then(result => {
            this.setState({ userId: result.account_number }, () =>
                this.loadNamespace(),
            );
        });
    }

    render() {
        const {
            namespace,
            errorMessages,
            saving,
            redirect,
            params,
            userId,
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
                <AlertList
                    alerts={this.state.alerts}
                    closeAlert={i => this.closeAlert(i)}
                />
                <Main>
                    <Section className='body'>
                        {params.tab.toLowerCase() === 'edit details' ? (
                            <NamespaceForm
                                userId={userId}
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

    private removeGroupsPrefix(groups) {
        let unprefixedGroupOwners = [Constants.ADMIN_GROUP];
        for (const owner of groups) {
            if (owner == Constants.ADMIN_GROUP) {
                continue;
            }
            // 'rh-identity-account', '<id>'
            else unprefixedGroupOwners.push(owner.split(':')[1]);
        }
        return unprefixedGroupOwners;
    }

    private loadNamespace() {
        MyNamespaceAPI.get(this.props.match.params['namespace'])
            .then(response => {
                response.data.groups = this.removeGroupsPrefix(
                    response.data.groups,
                );
                this.setState({ namespace: response.data });
            })
            .catch(response => {
                this.setState({ redirect: Paths.notFound });
            });
    }

    private saveNamespace() {
        this.setState({ saving: true }, () => {
            MyNamespaceAPI.update(
                this.state.namespace.name,
                this.state.namespace,
            )
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
                    } else if (result.status === 404) {
                        this.setState({
                            alerts: this.state.alerts.concat({
                                variant: 'danger',
                                title: `API Error: ${error.response.status}`,
                                description: `You don't have permissions to update this namespace.`,
                            }),
                            saving: false,
                        });
                    }
                });
        });
    }
    private get closeAlert() {
        return closeAlertMixin('alerts');
    }

    private cancel() {
        this.setState({
            redirect: formatPath(Paths.myCollections, {
                namespace: this.state.namespace.name,
            }),
        });
    }
}

export default withRouter(EditNamespace);
