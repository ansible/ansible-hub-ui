import * as React from 'react';
import { Modal } from '@patternfly/react-core';
import { Form, FormGroup, ActionGroup } from '@patternfly/react-core';
import {
    Button,
    ButtonVariant,
    InputGroup,
    TextInput,
} from '@patternfly/react-core';
import { NamespaceAPI } from '../../api';

interface IProps {
    isOpen: boolean;
    toggleModal: object;
    onCreateSuccess: (result) => void;
}

interface IState {
    newNamespaceName: string;
    newNamespaceNameValid: boolean;
    newNamespaceGroupIds: string;
    errorMessages: any;
}

export class NamespaceModal extends React.Component<IProps, IState> {
    toggleModal;

    constructor(props) {
        super(props);

        this.toggleModal = this.props.toggleModal;
        this.state = {
            newNamespaceName: '',
            newNamespaceNameValid: true,
            newNamespaceGroupIds: '',
            errorMessages: {},
        };
    }

    private namespaceOwners() {
        const ids = this.state.newNamespaceGroupIds.split(',');
        return ids.map(id => id.trim());
    }

    private namespaceOwnersValid() {
        const isNumber = currentValue => !isNaN(Number(currentValue));
        const valid = this.namespaceOwners().every(isNumber);
        if (!valid) {
            const errorMessage = 'Provided identifications are not numbers';
            this.state.errorMessages['groups'] = errorMessage;
        }
        return valid;
    }

    private newNamespaceNameValid() {
        const valid = !!this.state.newNamespaceName.trim();
        if (!valid) {
            const errorMessage = 'Please, provide the namespace name';
            this.setState({ newNamespaceNameValid: false });
            this.state.errorMessages['name'] = errorMessage;
        } else {
            this.setState({ newNamespaceNameValid: true });
            delete this.state.errorMessages['name'];
        }
    }

    private handleSubmit = event => {
        const groups = this.namespaceOwners();
        groups.push('system:partner-engineers');
        const data: any = {
            name: this.state.newNamespaceName,
            groups: groups,
        };
        NamespaceAPI.create(data)
            .then(results => {
                this.toggleModal();
                this.setState({
                    newNamespaceName: '',
                    newNamespaceGroupIds: '',
                    errorMessages: {},
                });
                this.props.onCreateSuccess(data);
            })
            .catch(error => {
                const result = error.response;
                if (result.status === 400) {
                    const messages: any = {};
                    for (const e of result.data.errors) {
                        messages[e.source.parameter] = e.detail;
                    }
                    this.setState({ errorMessages: messages });
                }
            });
    };

    render() {
        const {
            newNamespaceName,
            newNamespaceGroupIds,
            errorMessages,
        } = this.state;

        return (
            <Modal
                isLarge
                title='Create a new namespace'
                isOpen={this.props.isOpen}
                onClose={this.toggleModal}
                actions={[
                    <Button
                        key='confirm'
                        variant='primary'
                        onClick={this.handleSubmit}
                    >
                        Create
                    </Button>,
                    <Button
                        key='cancel'
                        variant='link'
                        onClick={this.toggleModal}
                    >
                        Cancel
                    </Button>,
                ]}
                isFooterLeftAligned
            >
                <Form>
                    <FormGroup
                        label='Name'
                        isRequired
                        fieldId='name'
                        helperText='Please, provide the namespace name'
                        helperTextInvalid={errorMessages['name']}
                        // This prop will be deprecated. You should use validated instead.
                        isValid={this.state.newNamespaceNameValid}
                    >
                        <TextInput
                            isRequired
                            type='text'
                            id='newNamespaceName'
                            name='newNamespaceName'
                            value={newNamespaceName}
                            onChange={value => {
                                this.setState(
                                    { newNamespaceName: value },
                                    () => {
                                        this.newNamespaceNameValid();
                                    },
                                );
                            }}
                        />
                    </FormGroup>
                    <FormGroup
                        label='Namespace owners'
                        fieldId='groups'
                        helperText='Please, provide comma-separated Red Hat account identifications'
                        helperTextInvalid={errorMessages['groups']}
                        isValid={this.namespaceOwnersValid()}
                    >
                        <TextInput
                            isRequired
                            type='text'
                            id='newNamespaceGroupIds'
                            name='newNamespaceGroupIds'
                            value={newNamespaceGroupIds}
                            onChange={value =>
                                this.setState({
                                    newNamespaceGroupIds: value,
                                })
                            }
                        />
                    </FormGroup>
                </Form>
            </Modal>
        );
    }
}
