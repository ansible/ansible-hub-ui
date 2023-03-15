import { t } from '@lingui/macro';
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { AnsibleRepositoryType } from 'src/api';
import { LazyDistributions, PulpLabels } from 'src/components';
import { ErrorMessagesType } from 'src/utilities';

interface IProps {
  allowEditName: boolean;
  errorMessages: ErrorMessagesType;
  onCancel: () => void;
  onSave: ({ createDistribution, createLabel }) => void;
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

  const [createDistribution, setCreateDistribution] = useState(true);
  const [disabledDistribution, setDisabledDistribution] = useState(false);
  const onDistributionsLoad = (distributions) => {
    if (distributions?.find?.(({ name }) => name === repository.name)) {
      setCreateDistribution(false);
      setDisabledDistribution(true);
    } else {
      setCreateDistribution(true);
      setDisabledDistribution(false);
    }
  };

  const createLabel = repository?.pulp_labels?.content !== 'approved_for_use';

  return (
    <Form>
      {stringField('name', t`Name`)}
      {stringField('description', t`Description`)}
      {numericField('retain_repo_versions', t`Retained number of versions`)}
      {inputField('none', t`Repository type`, {
        isDisabled: true,
        placeholder: wip,
      })}
      <FormGroup
        key={'distributions'}
        fieldId={'distributions'}
        label={t`Distributions`}
      >
        <LazyDistributions
          emptyText={t`None`}
          repositoryHref={repository.pulp_href}
          onLoad={onDistributionsLoad}
        />
        <br />
        <Checkbox
          isChecked={createDistribution}
          isDisabled={disabledDistribution}
          onChange={(value) => setCreateDistribution(value)}
          label={t`Create a "${repository.name}" distribution`}
          id='create_distribution'
        />
      </FormGroup>
      <FormGroup key={'labels'} fieldId={'labels'} label={t`Labels`}>
        <PulpLabels labels={repository.pulp_labels} />
        <br />
        <Checkbox
          isChecked={createLabel}
          isDisabled={true}
          label={t`Create a "content: approved_for_use" label`}
          id='create_label'
        />
      </FormGroup>
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
          onClick={() => onSave({ createDistribution, createLabel })}
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
