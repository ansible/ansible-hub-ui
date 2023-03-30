import { Trans, t } from '@lingui/macro';
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
  HelperText,
  LazyDistributions,
  PulpLabels,
} from 'src/components';
import { ErrorMessagesType, errorMessage } from 'src/utilities';

interface IProps {
  allowEditName: boolean;
  errorMessages: ErrorMessagesType;
  onCancel: () => void;
  onSave: ({ createDistribution, hideFromSearch, pipeline }) => void;
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
  const formGroup = (fieldName, label, helperText, children) => (
    <FormGroup
      key={fieldName}
      fieldId={fieldName}
      label={
        helperText ? (
          <>
            {label} <HelperText content={helperText} />
          </>
        ) : (
          label
        )
      }
      isRequired={requiredFields.includes(fieldName)}
      validated={toError(!(fieldName in errorMessages))}
      helperTextInvalid={errorMessages[fieldName]}
    >
      {children}
    </FormGroup>
  );
  const inputField = (fieldName, label, helperText, props) =>
    formGroup(
      fieldName,
      label,
      helperText,
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
      />,
    );
  const stringField = (fieldName, label, helperText?) =>
    inputField(fieldName, label, helperText, { type: 'text' });
  const numericField = (fieldName, label, helperText?) =>
    inputField(fieldName, label, helperText, { type: 'number' });

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

  const [hideFromSearch, setHideFromSearch] = useState(
    repository?.pulp_labels?.hide_from_search === '',
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

  const pipelineHelp = (
    <Trans>
      Pipeline adds repository labels with pre-defined meanings:
      <ul>
        <li>
          <b>None</b> - users require permissions to modify content in this
          repository to upload collection.
        </li>
        <li>
          <b>Approved</b> - collections can be moved here on approval.
          Publishing directly to this repository is disabled.
        </li>
        <li>
          <b>Staging</b> - collections uploaded here require approval before
          showing up on the search page. Anyone with upload permissions for a
          namespace can upload collections to this repository.
        </li>
      </ul>
    </Trans>
  );
  const labelsHelp = (
    <Trans>
      Repository labels can change the context in which a repository is seen.
      <ul>
        <li>
          <b>Hide from search</b> (
          <pre style={{ display: 'inline-block' }}>hide_from_search</pre>) -
          prevent collections in this repository from showing up on the home
          page
        </li>
        <li>
          (<pre style={{ display: 'inline-block' }}>pipeline: *</pre>) - see
          Pipeline above
        </li>
      </ul>
    </Trans>
  );

  return (
    <Form>
      {stringField('name', t`Name`)}
      {stringField('description', t`Description`)}
      {numericField(
        'retain_repo_versions',
        t`Retained number of versions`,
        t`In order to retain all versions, leave this field blank.`,
      )}

      {formGroup(
        'distributions',
        t`Distributions`,
        t`Content in repositories without a distribution will not be visible to clients for sync, download or search.`,
        <>
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
        </>,
      )}

      {formGroup(
        'pipeline',
        t`Pipeline`,
        pipelineHelp,
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
        </Select>,
      )}

      {formGroup(
        'labels',
        t`Labels`,
        labelsHelp,
        <>
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
              isChecked={hideFromSearch}
              isDisabled={disableHideFromSearch}
              label={t`Hide from search`}
              id='hide_from_search'
              onChange={(value) => setHideFromSearch(value)}
            />
          </div>
        </>,
      )}

      {formGroup(
        'private',
        t`Make private`,
        t`Make the repository private.`,
        <Checkbox
          id='private'
          isChecked={repository.private}
          label={t`Make private`}
          onChange={(value) =>
            updateRepository({ ...repository, private: value })
          }
        />,
      )}

      {formGroup(
        'remote',
        t`Remote`,
        t`Setting a remote allows a repository to sync from elsewhere.`,
        <>
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
                  ? [
                      {
                        name: selectedRemote.name,
                        id: selectedRemote.pulp_href,
                      },
                    ]
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
        </>,
      )}

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
              hideFromSearch,
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
