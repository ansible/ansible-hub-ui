import { t } from '@lingui/macro';
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  Select,
  SelectOption,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { AnsibleRemoteAPI, AnsibleRepositoryType } from 'src/api';
import {
  APISearchTypeAhead,
  LazyDistributions,
  PulpLabels,
} from 'src/components';
import { ErrorMessagesType, errorMessage } from 'src/utilities';

interface IProps {
  allowEditName: boolean;
  errorMessages: ErrorMessagesType;
  onCancel: () => void;
  onSave: ({
    createDistribution,
    createLabel,
    hideFromSearch,
    isPrivate,
    pipeline,
  }) => void;
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
  const [hideFromSearch, setHideFromSearch] = useState(
    repository?.pulp_labels?.hide_from_search === '',
  );
  const [isPrivate, setIsPrivate] = useState(
    repository?.pulp_labels?.is_private === 'true',
  );
  const [pipeline, setPipeline] = useState(repository?.pulp_labels?.pipeline);
  const [disableHideFromSearch, setDisableHideFromSearch] = useState(
    hideFromSearch && pipeline === 'staging',
  );

  const [remotes, setRemotes] = useState(null);
  const [remotesError, setRemotesError] = useState(null);
  const loadRemotes = (name?) => {
    setRemotesError(null);
    AnsibleRemoteAPI.list({ ...(name ? { name__icontains: name } : {}) })
      .then(({ data }) => setRemotes(data.results))
      .catch((e) => {
        const { status, statusText } = e.response;
        setRemotes([]);
        setRemotesError(errorMessage(status, statusText));
      });
  };

  useEffect(() => loadRemotes(), []);

  const selectedRemote = remotes?.find?.(
    ({ pulp_href }) => pulp_href === repository?.remote,
  );

  const [selectedPipeline, setSelectedPipeline] = useState(
    hideFromSearch && pipeline === 'staging'
      ? 'staging'
      : pipeline === 'approved'
      ? 'approved'
      : 'none',
  );

  const [selectOpen, setSelectOpen] = useState(false);

  const selectPipeline = (value) => {
    if (disableHideFromSearch && value !== 'staging') {
      setHideFromSearch(repository?.pulp_labels?.hide_from_search === '');
    }
    if (value === 'staging') {
      setSelectedPipeline(value);
      setPipeline(value);
      setHideFromSearch(true);
      setDisableHideFromSearch(true);
    } else if (value === 'approved') {
      setSelectedPipeline(value);
      setPipeline(value);
      setDisableHideFromSearch(false);
    } else {
      setSelectedPipeline('none');
      setPipeline(null);
      setDisableHideFromSearch(false);
    }
    setSelectOpen(false);
  };

  const selectOptions = {
    staging: { id: 'staging', toString: () => t`Staging` },
    approved: { id: 'approved', toString: () => t`Approved` },
    none: { id: 'none', toString: () => t`None` },
  };

  return (
    <Form>
      {stringField('name', t`Name`)}
      {stringField('description', t`Description`)}
      {numericField('retain_repo_versions', t`Retained number of versions`)}

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

      <FormGroup key='pipeline' fieldId='pipeline' label={t`Pipeline`}>
        <Select
          variant='single'
          isOpen={selectOpen}
          onToggle={() => setSelectOpen(!selectOpen)}
          onSelect={(_e, value: { id }) => selectPipeline(value.id)}
          selections={selectOptions[selectedPipeline]}
        >
          {Object.entries(selectOptions).map(([k, v]) => (
            <SelectOption key={k} value={v} />
          ))}
        </Select>
      </FormGroup>

      <FormGroup key={'labels'} fieldId={'labels'} label={t`Labels`}>
        <div
          // prevents "N more" clicks from submitting the form
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <PulpLabels labels={repository.pulp_labels} />
        </div>
        <div style={{ marginTop: '12px' }}>
          <Checkbox
            isChecked={createLabel}
            isDisabled={true}
            label={t`Create a "content: approved_for_use" label`}
            id='create_label'
          />
          <Checkbox
            isChecked={hideFromSearch}
            isDisabled={disableHideFromSearch}
            label={t`Hide from search`}
            id='hide_from_search'
            onChange={(value) => setHideFromSearch(value)}
          />
          <Checkbox
            isChecked={isPrivate}
            label={t`Make private`}
            id='is_private'
            onChange={(value) => setIsPrivate(value)}
          />
        </div>
      </FormGroup>

      <FormGroup key='remote' fieldId='remote' label={t`Remote`}>
        {remotes ? (
          <APISearchTypeAhead
            loadResults={loadRemotes}
            onClear={() => updateRepository({ ...repository, remote: null })}
            onSelect={(_event, value) =>
              updateRepository({
                ...repository,
                remote: remotes.find(({ name }) => name === value)?.pulp_href,
              })
            }
            placeholderText={t`Select a remote`}
            results={remotes}
            selections={
              selectedRemote
                ? [{ name: selectedRemote.name, id: selectedRemote.pulp_href }]
                : []
            }
          />
        ) : null}
        {remotesError ? (
          <span
            style={{
              color: 'var(--pf-global--danger-color--200)',
            }}
          >
            {t`Failed to load remotes: ${remotesError}`}
          </span>
        ) : null}
        {!remotes && !remotesError ? <Spinner size='sm' /> : null}
      </FormGroup>

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
          onClick={() =>
            onSave({
              createDistribution,
              createLabel,
              hideFromSearch,
              isPrivate,
              pipeline,
            })
          }
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
