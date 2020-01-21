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
}

interface IState {
    newNamespaceName: string;
    newNamespaceGroupIds: string;
    errorMessages: any;
}

export class NamespaceModal extends React.Component<IProps, IState> {
    handleSubmit;
    toggleModal;

    constructor(props) {
        super(props);

        this.toggleModal = this.props.toggleModal;
        this.state = {
            newNamespaceName: '',
            newNamespaceGroupIds: '',
            errorMessages: {},
        };

        this.handleSubmit = event => {
            const ids = this.state.newNamespaceGroupIds.split(',');
            const groups = ids.map(id => id.trim());
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
                    window.location.href = window.location + '/' + data['name'];
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
    }

    render() {
        const {
            newNamespaceName,
            newNamespaceGroupIds,
            errorMessages,
        } = this.state;

        return (
            <React.Fragment>
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
                            Confirm
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
                            fieldId='simple-form-name'
                            helperText='Please provide the namespace name'
                        >
                            <TextInput
                                isRequired
                                type='text'
                                id='newNamespaceName'
                                name='newNamespaceName'
                                aria-describedby='simple-form-name-helper'
                                value={newNamespaceName}
                                onChange={value =>
                                    this.setState({ newNamespaceName: value })
                                }
                            />
                        </FormGroup>
                        <FormGroup
                            label='Red Hat Accounts'
                            fieldId='groups'
                            helperText='Please provide comma-separated Red Hat Account identifications'
                            helperTextInvalid={errorMessages['groups']}
                            isValid={!('groups' in errorMessages)}
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
            </React.Fragment>
        );
    }
}
