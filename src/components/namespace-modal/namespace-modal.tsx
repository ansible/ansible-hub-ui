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
import { NamespaceAPI } from '../../api';
import { Constants } from '../../constants';

interface IProps {
  isOpen: boolean;
  toggleModal: object;
  onCreateSuccess: (result) => void;
}

interface IState {
  newNamespaceName: string;
  newNamespaceNameValid: boolean;
  newNamespaceGroupIds: string;
  newNamespaceGroupIdsValid: boolean;
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
      newNamespaceGroupIdsValid: true,
      errorMessages: {},
    };
  }

  private namespaceOwners() {
    if (this.state.newNamespaceGroupIds === '') {
      return [];
    }
    const ids = this.state.newNamespaceGroupIds.split(',');
    return ids.map(id => id.trim());
  }

  private namespaceOwnersValid() {
    const error: any = this.state.errorMessages;

    const isNumber = currentValue => !isNaN(Number(currentValue));
    const valid = this.namespaceOwners().every(isNumber);

    if (valid) {
      delete error['groups'];
    } else {
      error['groups'] = 'Provided identifications are not numbers';
    }

    this.setState({
      newNamespaceGroupIdsValid: !('groups' in error),
      errorMessages: error,
    });
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
    const groups = this.namespaceOwners();
    groups.push(Constants.ADMIN_GROUP);
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
        const messages: any = this.state.errorMessages;
        for (const e of result.data.errors) {
          messages[e.source.parameter] = e.detail;
        }
        this.setState({
          errorMessages: messages,
          newNamespaceNameValid: !('name' in messages),
          newNamespaceGroupIdsValid: !('groups' in messages),
        });
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
          <Button key='confirm' variant='primary' onClick={this.handleSubmit}>
            Create
          </Button>,
          <Button key='cancel' variant='link' onClick={this.toggleModal}>
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
            helperTextInvalid={this.state.errorMessages['name']}
            // This prop will be deprecated. You should use validated instead.
            isValid={this.state.newNamespaceNameValid}
          >
            <InputGroup>
              <TextInput
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
            helperText='Please, provide comma-separated Red Hat account identifications'
            helperTextInvalid={this.state.errorMessages['groups']}
            isValid={this.state.newNamespaceGroupIdsValid}
          >
            <TextInput
              isRequired
              type='text'
              id='newNamespaceGroupIds'
              name='newNamespaceGroupIds'
              value={newNamespaceGroupIds}
              onChange={value => {
                this.setState({ newNamespaceGroupIds: value }, () => {
                  this.namespaceOwnersValid();
                });
              }}
            />
          </FormGroup>
        </Form>
      </Modal>
    );
  }
}
