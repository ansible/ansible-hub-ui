import { t } from '@lingui/macro';
import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  InputGroup,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';

import { NamespaceAPI } from 'src/api';
import { HelperText } from 'src/components';
import { ErrorMessagesType } from 'src/utilities';

interface IProps {
  isOpen: boolean;
  toggleModal: object;
  onCreateSuccess: (result) => void;
}

interface IState {
  newNamespaceName: string;
  newNamespaceNameValid: boolean;
  errorMessages: ErrorMessagesType;
}

export class NamespaceModal extends React.Component<IProps, IState> {
  toggleModal;

  constructor(props) {
    super(props);

    this.toggleModal = this.props.toggleModal;
    this.state = {
      newNamespaceName: '',
      newNamespaceNameValid: true,
      errorMessages: {},
    };
  }

  private newNamespaceNameIsValid() {
    const error = this.state.errorMessages;
    const name: string = this.state.newNamespaceName;

    if (name == '') {
      error['name'] = t`Please, provide the namespace name`;
    } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      error['name'] = t`Name can only contain letters and numbers`;
    } else if (name.length <= 2) {
      error['name'] = t`Name must be longer than 2 characters`;
    } else if (name.startsWith('_')) {
      error['name'] = t`Name cannot begin with '_'`;
    } else {
      delete error['name'];
    }

    this.setState({
      newNamespaceNameValid: !('name' in error),
      errorMessages: error,
    });
  }

  private handleSubmit = () => {
    const data = {
      name: this.state.newNamespaceName,
      groups: [],
    };
    NamespaceAPI.create(data)
      .then(() => {
        this.toggleModal();
        this.setState({
          newNamespaceName: '',
          errorMessages: {},
        });
        this.props.onCreateSuccess(data);
      })
      .catch((error) => {
        const result = error.response;
        const messages = this.state.errorMessages;
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
    const { newNamespaceName, newNamespaceNameValid } = this.state;

    return (
      <Modal
        variant={ModalVariant.medium}
        title={t`Create a new namespace`}
        isOpen={this.props.isOpen}
        onClose={this.toggleModal}
        actions={[
          <Button
            key='confirm'
            variant='primary'
            onClick={this.handleSubmit}
            isDisabled={!newNamespaceName || !newNamespaceNameValid}
          >
            {t`Create`}
          </Button>,
          <Button key='cancel' variant='link' onClick={this.toggleModal}>
            {t`Cancel`}
          </Button>,
        ]}
      >
        <Form>
          <FormGroup
            label={t`Name`}
            isRequired
            fieldId='name'
            helperTextInvalid={this.state.errorMessages['name']}
            validated={this.toError(this.state.newNamespaceNameValid)}
            labelIcon={
              <HelperText
                content={t`Namespace names are limited to alphanumeric characters and underscores, must have a minimum length of 2 characters and cannot start with an ‘_’.`}
                header={t`Namespace name`}
              />
            }
          >
            <InputGroup>
              <TextInput
                validated={this.toError(this.state.newNamespaceNameValid)}
                isRequired
                type='text'
                id='newNamespaceName'
                name='newNamespaceName'
                value={newNamespaceName}
                onChange={(value) => {
                  this.setState({ newNamespaceName: value }, () => {
                    this.newNamespaceNameIsValid();
                  });
                }}
              />
            </InputGroup>
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
