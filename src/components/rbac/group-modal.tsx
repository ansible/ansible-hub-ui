import { t } from '@lingui/macro';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { Component } from 'react';
import { FormFieldHelper } from 'src/components';
import { ErrorMessagesType } from 'src/utilities';

interface IProps {
  onCancel?: () => void;
  onSave?: (string) => void;
  clearErrors?: () => void;
  group?: { name: string };
  errorMessage?: ErrorMessagesType;
}

interface IState {
  name: string;
}

export class GroupModal extends Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      name:
        !this.props.group || !this.props.group.name
          ? ''
          : this.props.group.name,
    };
  }

  render() {
    const { onCancel, onSave, clearErrors } = this.props;
    return (
      <Modal
        variant={ModalVariant.medium}
        onClose={() => {
          onCancel();
        }}
        isOpen
        title={t`Create a group`}
        actions={[
          <div key='create' data-cy='create-group-button'>
            <Button
              isDisabled={
                this.state.name.length === 0 ||
                (this.props.group && this.state.name === this.props.group.name)
              }
              key='create'
              variant='primary'
              onClick={() => onSave(this.state.name)}
            >
              {!this.props.group ? t`Create` : t`Save`}
            </Button>
          </div>,
          <Button key='cancel' variant='link' onClick={() => onCancel()}>
            {t`Cancel`}
          </Button>,
        ]}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(this.state.name);
          }}
        >
          <FormGroup isRequired key='name' fieldId='name' label={t`Name`}>
            <TextInput
              id='group_name'
              value={this.state.name}
              onChange={(_event, value) => {
                this.setState({ name: value });
                clearErrors();
              }}
              type='text'
              validated={this.props.errorMessage ? 'error' : 'default'}
            />
            <FormFieldHelper
              variant={this.props.errorMessage ? 'error' : 'default'}
            >
              {this.props.errorMessage?.name}
            </FormFieldHelper>
          </FormGroup>
        </Form>
      </Modal>
    );
  }
}
