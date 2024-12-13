import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { Select, SelectOption } from '@patternfly/react-core/deprecated';
import { useEffect, useState } from 'react';
import { AnsibleRemoteAPI, type AnsibleRepositoryType } from 'src/api';
import {
  FormFieldHelper,
  HelpButton,
  LazyDistributions,
  PulpLabels,
  Spinner,
  Typeahead,
} from 'src/components';
import {
  type ErrorMessagesType,
  errorMessage,
  repositoryBasePath,
} from 'src/utilities';

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

  const formGroup = (fieldName, label, helperText, children) => (
    <FormGroup
      key={fieldName}
      fieldId={fieldName}
      label={
        helperText ? (
          <>
            {label} <HelpButton content={helperText} />
          </>
        ) : (
          label
        )
      }
      isRequired={requiredFields.includes(fieldName)}
    >
      {children}
      <FormFieldHelper
        variant={fieldName in errorMessages ? 'error' : 'default'}
      >
        {errorMessages[fieldName]}
      </FormFieldHelper>
    </FormGroup>
  );
  const inputField = (fieldName, label, helperText, props) =>
    formGroup(
      fieldName,
      label,
      helperText,
      <TextInput
        validated={fieldName in errorMessages ? 'error' : 'default'}
        isRequired={requiredFields.includes(fieldName)}
        isDisabled={disabledFields.includes(fieldName)}
        id={fieldName}
        value={repository[fieldName] || ''}
        onChange={(_event, value) =>
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
  const onDistributionsLoad = (distroBasePath) => {
    if (distroBasePath) {
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

  useEffect(() => {
    // create
    if (!repository || !repository.name) {
      onDistributionsLoad(null);
      return;
    }

    repositoryBasePath(repository.name, repository.pulp_href)
      .catch(() => null)
      .then(onDistributionsLoad);
  }, [repository?.pulp_href]);

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
          />
          <br />
          <Checkbox
            isChecked={createDistribution}
            isDisabled={disabledDistribution}
            onChange={(_event, value) => setCreateDistribution(value)}
            label={t`Create a "${repository.name}" distribution`}
            id='create_distribution'
          />
        </>,
      )}

      {formGroup(
        'pipeline',
        t`Pipeline`,
        pipelineHelp,
        <div data-cy='pipeline'>
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
        </div>,
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
              onChange={(_event, value) => setHideFromSearch(value)}
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
          onChange={(_event, value) =>
            updateRepository({ ...repository, private: value })
          }
        />,
      )}

      {formGroup(
        'remote',
        t`Remote`,
        t`Setting a remote allows a repository to sync from elsewhere.`,
        <>
          <div data-cy='remote'>
            {remotes ? (
              <Typeahead
                loadResults={loadRemotes}
                onClear={() =>
                  updateRepository({ ...repository, remote: null })
                }
                onSelect={(_event, value) =>
                  updateRepository({
                    ...repository,
                    remote: remotes.find(({ name }) => name === value)
                      ?.pulp_href,
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
                  color: 'var(--pf-v5-global--danger-color--200)',
                }}
              >
                {t`Failed to load remotes: ${remotesError}`}
              </span>
            ) : null}
            {!remotes && !remotesError ? <Spinner size='sm' /> : null}
          </div>
        </>,
      )}

      {errorMessages['__nofield'] ? (
        <span
          style={{
            color: 'var(--pf-v5-global--danger-color--200)',
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
