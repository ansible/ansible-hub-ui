import { Trans, t } from '@lingui/macro';
import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import React from 'react';
import { AnsibleRepositoryType } from 'src/api';
import { ErrorMessagesType } from 'src/utilities';

interface IProps {
  allowEditName: boolean;
  errorMessages: ErrorMessagesType;
  onCancel: () => void;
  onSave: () => void;
  repository: AnsibleRepositoryType;
  updateRepository: (r) => void;
}

export const AnsibleRepositoryForm = ({
  allowEditName,
  errorMessages,
  onCancel,
  onSave,
  repository,
  updateRepository,
}: IProps) => {
  const requiredFields = [];
  const disabledFields = allowEditName ? [] : ['name'];

  const toError = (bool) => (bool ? 'default' : 'error');
  const inputField = (fieldName, label, props) => (
    <FormGroup
      key={fieldName}
      fieldId={fieldName}
      label={label}
      isRequired={requiredFields.includes(fieldName)}
      validated={toError(!(fieldName in errorMessages))}
      helperTextInvalid={errorMessages[fieldName]}
    >
      <TextInput
        validated={toError(!(fieldName in errorMessages))}
        isRequired={requiredFields.includes(fieldName)}
        isDisabled={disabledFields.includes(fieldName)}
        id={fieldName}
        value={repository[fieldName] || ''}
        onChange={(value) =>
          updateRepository({ ...repository, [fieldName]: value })
        }
        {...props}
      />
    </FormGroup>
  );
  const stringField = (fieldName, label) =>
    inputField(fieldName, label, { type: 'text' });
  const numericField = (fieldName, label) =>
    inputField(fieldName, label, { type: 'number' });
  const wip = '🚧 ';

  const isValid = !requiredFields.find((field) => !repository[field]);

  return (
    <Form>
      {stringField('name', t`Name`)}
      {stringField('description', t`Description`)}
      {numericField('retain_repo_versions', t`Retained number of versions`)}
      {inputField('none', t`Repository type`, {
        isDisabled: true,
        placeholder: wip,
      })}
      {inputField('none', t`Distribution`, {
        isDisabled: true,
        placeholder: wip,
      })}
      {inputField('none', t`Labels`, { isDisabled: true, placeholder: wip })}
      {inputField('none', t`Remote`, { isDisabled: true, placeholder: wip })}
      {errorMessages['__nofield'] ? (
        <span
          style={{
            color: 'var(--pf-global--danger-color--200)',
          }}
        >
          {errorMessages['__nofield']}
        </span>
      ) : null}
      <ActionGroup key='actions'>
        <Button
          isDisabled={!isValid}
          key='confirm'
          variant='primary'
          onClick={onSave}
        >
          {t`Save`}
        </Button>
        <Button key='cancel' variant='link' onClick={onCancel}>
          {t`Cancel`}
        </Button>
      </ActionGroup>
    </Form>
  );
};
