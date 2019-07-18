import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import { Main } from '@redhat-cloud-services/frontend-components';

import { EditNamespaceHeader } from '../../components/headers/edit-namespace';
import { NamespaceForm } from '../../components/namespace-form/namespace-form';

import { NamespaceAPI } from '../../api/namespace';
import { Namespace } from '../../api/response-types/namespace';

import { Paths, formatPath } from '../../paths';

interface IProps extends RouteComponentProps {}

interface IState {
    namespace: Namespace;
    newLinkName: string;
    newLinkURL: string;
    errorMessages: any;
    saving: boolean;
    redirect: string;
}

class EditNamespace extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            namespace: null,
            newLinkURL: '',
            newLinkName: '',
            errorMessages: {},
            saving: false,
            redirect: null,
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
        const { namespace, errorMessages, saving, redirect } = this.state;

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
                ></EditNamespaceHeader>
                <Main>
                    <NamespaceForm
                        namespace={namespace}
                        errorMessages={errorMessages}
                        saving={saving}
                        updateNamespace={namespace =>
                            this.setState({ namespace: namespace })
                        }
                        save={() => this.saveNamespace()}
                        cancel={() =>
                            this.setState({
                                redirect: formatPath(Paths.myCollections, {
                                    namespace: this.state.namespace.name,
                                }),
                            })
                        }
                    />
                </Main>
            </React.Fragment>
        );
    }

    saveNamespace() {
        this.setState({ saving: true }, () => {
            NamespaceAPI.update(this.state.namespace.name, this.state.namespace)
                .then(result => {
                    this.setState({
                        namespace: result.data,
                        errorMessages: {},
                        saving: false,
                        redirect: formatPath(Paths.myCollections, {
                            namespace: result.data.name,
                        }),
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

    validateNamesace(namespace) {
        // TODO: add data validation once error format and validation checks
        // are known
    }
}

export default withRouter(EditNamespace);
