import * as React from 'react';
import { Modal } from '@patternfly/react-core';
import { Form, FormGroup, ActionGroup } from '@patternfly/react-core';
import {
  Button,
  ButtonVariant,
  InputGroup,
  Popover,
  PopoverPosition,
  TextInput,
} from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { NamespaceAPI, GroupObjectPermissionType } from '../../api';

import { ObjectPerissionField } from '../../components';

interface IProps {
  isOpen: boolean;
  toggleModal: object;
  onCreateSuccess: (result) => void;
}

interface IState {
  newNamespaceName: string;
  newNamespaceNameValid: boolean;
  newGroups: GroupObjectPermissionType[];
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
      newGroups: [],
      errorMessages: {},
    };
  }

  private newNamespaceNameIsValid() {
    const error: any = this.state.errorMessages;
    const name: string = this.state.newNamespaceName;

    if (name == '') {
      error['name'] = 'Please, provide the namespace name';
    } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      error['name'] = 'Name can only contain [A-Za-z0-9_]';
    } else if (name.length <= 2) {
      error['name'] = 'Name must be longer than 2 characters';
    } else if (name.startsWith('_')) {
      error['name'] = "Name cannot begin with '_'";
    } else {
      delete error['name'];
    }

    this.setState({
      newNamespaceNameValid: !('name' in error),
      errorMessages: error,
    });
  }

  private handleSubmit = event => {
    const data: any = {
      name: this.state.newNamespaceName,
      groups: this.state.newGroups,
    };
    NamespaceAPI.create(data)
      .then(results => {
        this.toggleModal();
        this.setState({
          newNamespaceName: '',
          newGroups: [],
          errorMessages: {},
        });
        this.props.onCreateSuccess(data);
      })
      .catch(error => {
        const result = error.response;
        const messages: any = this.state.errorMessages;
        for (const e of result.data.errors) {
          messages[e.source.parameter] = e.detail;
        }
        this.setState({
          errorMessages: messages,
          newNamespaceNameValid: !('name' in messages),
        });
      });
  };

  render() {
    const { newNamespaceName, newGroups } = this.state;
    return (
      <Modal
        variant='large'
        title='Create a new namespace'
        isOpen={this.props.isOpen}
        onClose={this.toggleModal}
        actions={[
          <Button
            key='confirm'
            variant='primary'
            onClick={this.handleSubmit}
            isDisabled={!newNamespaceName}
          >
            Create
          </Button>,
          <Button key='cancel' variant='link' onClick={this.toggleModal}>
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup
            label='Name'
            isRequired
            fieldId='name'
            helperText='Please, provide the namespace name'
            helperTextInvalid={this.state.errorMessages['name']}
            validated={this.toError(this.state.newNamespaceNameValid)}
          >
            <InputGroup>
              <TextInput
                validated={this.toError(this.state.newNamespaceNameValid)}
                isRequired
                type='text'
                id='newNamespaceName'
                name='newNamespaceName'
                value={newNamespaceName}
                onChange={value => {
                  this.setState({ newNamespaceName: value }, () => {
                    this.newNamespaceNameIsValid();
                  });
                }}
              />
              <Popover
                aria-label='popover example'
                position={PopoverPosition.top}
                bodyContent='Namespace names are limited to lowercase word characters ([a-zA-Z0-9_]), must have a minimum length of 2 characters and cannot start with an ‘_’.'
              >
                <Button
                  variant={ButtonVariant.control}
                  aria-label='popover for input'
                >
                  <QuestionCircleIcon />
                </Button>
              </Popover>
            </InputGroup>
          </FormGroup>
          <FormGroup
            label='Namespace owners'
            fieldId='groups'
            helperTextInvalid={this.state.errorMessages['groups']}
          >
            <ObjectPerissionField
              availablePermissions={['change_namespace', 'upload_to_namespace']}
              groups={newGroups}
              setGroups={g => this.setState({ newGroups: g })}
              menuAppendTo='parent'
            />
          </FormGroup>
        </Form>
      </Modal>
    );
  }

  private toError(validated: boolean) {
    if (validated) {
      return 'default';
    } else {
      return 'error';
    }
  }
}
