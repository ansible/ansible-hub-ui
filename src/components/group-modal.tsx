import { t } from '@lingui/macro';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { FormFieldHelper } from 'src/components';
import { type ErrorMessagesType } from 'src/utilities';

interface IProps {
  clearErrors?: () => void;
  errorMessage?: ErrorMessagesType;
  group?: { name: string };
  onCancel?: () => void;
  onSave?: (string) => void;
}

export const GroupModal = ({
  clearErrors,
  errorMessage,
  group,
  onCancel,
  onSave,
}: IProps) => {
  const [name, setName] = useState<string>(group?.name || '');

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
            isDisabled={name.length === 0 || (group && name === group.name)}
            key='create'
            variant='primary'
            onClick={() => onSave(name)}
          >
            {!group ? t`Create` : t`Save`}
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
          onSave(name);
        }}
      >
        <FormGroup isRequired key='name' fieldId='name' label={t`Name`}>
          <TextInput
            id='group_name'
            value={name}
            onChange={(_event, value) => {
              setName(value);
              clearErrors();
            }}
            type='text'
            validated={errorMessage ? 'error' : 'default'}
          />
          <FormFieldHelper variant={errorMessage ? 'error' : 'default'}>
            {errorMessage?.name}
          </FormFieldHelper>
        </FormGroup>
      </Form>
    </Modal>
  );
};
