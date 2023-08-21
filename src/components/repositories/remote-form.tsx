import { Trans, t } from '@lingui/macro';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import {
  ActionGroup,
  Button,
  Checkbox,
  ExpandableSection,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Modal,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { DownloadIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import React from 'react';
import { RemoteType, WriteOnlyFieldType } from 'src/api';
import {
  FileUpload,
  FormFieldHelper,
  HelperText as HelperPopover,
  WriteOnlyField,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import {
  ErrorMessagesType,
  downloadString,
  isFieldSet,
  isWriteOnly,
  validateURLHelper,
} from 'src/utilities';

interface IProps {
  allowEditName?: boolean;
  closeModal: () => void;
  errorMessages: ErrorMessagesType;
  remote: RemoteType;
  remoteType: 'registry' | 'ansible-remote';
  saveRemote: () => void;
  showModal?: boolean;
  showMain?: boolean;
  title?: string;
  updateRemote: (remote) => void;
}

interface FormFilename {
  name: string;
  original: boolean;
}

interface IState {
  filenames: {
    requirements_file: FormFilename;
    client_key: FormFilename;
    client_cert: FormFilename;
    ca_cert: FormFilename;
  };
}

function toError(validated: boolean): 'default' | 'error' {
  return validated ? 'default' : 'error';
}

export class RemoteForm extends React.Component<IProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    const { requirements_file, client_key, client_cert, ca_cert } =
      props.remote || {};

    this.state = {
      filenames: {
        requirements_file: {
          name: requirements_file ? 'requirements.yml' : '',
          original: !!requirements_file,
        },
        client_key: {
          name: client_key ? 'client_key' : '',
          original: !!client_key,
        },
        client_cert: {
          name: client_cert ? 'client_cert' : '',
          original: !!client_cert,
        },
        ca_cert: {
          name: ca_cert ? 'ca_cert' : '',
          original: !!ca_cert,
        },
      },
    };

    // Shim in a default concurrency value to pass form validation (AAH-959)
    if (
      this.props.remoteType !== 'registry' &&
      this.props.remote.download_concurrency === null
    ) {
      this.updateRemote(10, 'download_concurrency');
    }
  }

  render() {
    const {
      allowEditName,
      closeModal,
      remote,
      saveRemote,
      showMain,
      showModal,
      remoteType,
      title,
    } = this.props;

    if (!remote) {
      return null;
    }

    const requiredFields = ['name', 'url'];
    let disabledFields = allowEditName ? [] : ['name'];

    switch (remoteType) {
      case 'ansible-remote':
        // require only name, url; nothing disabled
        break;

      case 'registry':
        disabledFields = disabledFields.concat([
          'auth_url',
          'token',
          'requirements_file',
          'signed_only',
        ]);
        break;
    }

    const save = (
      <Button
        isDisabled={!this.isValid(requiredFields)}
        key='confirm'
        variant='primary'
        onClick={() => saveRemote()}
      >
        {t`Save`}
      </Button>
    );
    const cancel = (
      <Button key='cancel' variant='link' onClick={() => closeModal()}>
        {t`Cancel`}
      </Button>
    );

    if (showMain) {
      return (
        <>
          {this.renderForm(
            requiredFields,
            disabledFields,
            <ActionGroup key='actions'>
              {save}
              {cancel}
            </ActionGroup>,
          )}
        </>
      );
    }

    return (
      <Modal
        isOpen={showModal}
        title={title || t`Edit remote`}
        variant='small'
        onClose={() => closeModal()}
        actions={[save, cancel]}
      >
        {this.renderForm(requiredFields, disabledFields)}
      </Modal>
    );
  }

  private renderForm(requiredFields, disabledFields, extra?) {
    const { errorMessages, remote, remoteType } = this.props;
    const { filenames } = this.state;
    const { collection_signing } = this.context.featureFlags;
    const writeOnlyFields =
      remote[
        remoteType === 'ansible-remote' ? 'hidden_fields' : 'write_only_fields'
      ];

    const docsAnsibleLink = (
      <a
        target='_blank'
        href='https://docs.ansible.com/ansible/latest/user_guide/collections_using.html#install-multiple-collections-with-a-requirements-file'
        rel='noreferrer'
      >
        requirements.yml
      </a>
    );

    const yamlTemplate = [
      '# Sample requirements.yaml',
      '',
      'collections:',
      '  - name: my_namespace.my_collection_name',
      '  - name: my_namespace.my_collection_name2',
    ].join('\n');

    const filename = (field) =>
      filenames[field].original ? t`(uploaded)` : filenames[field].name;
    // TODO no FileUpload on*Change with such sig now
    const fileOnChange = (field) => (_event, value, name) => {
      this.setState(
        {
          filenames: {
            ...filenames,
            [field]: {
              name,
              original: false,
            },
          },
        },
        () => this.updateRemote(value, field),
      );
    };

    const textField = (
      { id, label, value },
      formGroupProps = {},
      textInputProps = {},
      helperProps = null,
    ) => {
      if (!helperProps) {
        const variant = id in errorMessages ? 'error' : 'default';
        const children = errorMessages[id];
        helperProps = { variant, children };
      }

      return (
        <FormGroup
          fieldId={id}
          label={label}
          isRequired={requiredFields.includes(id)}
          {...formGroupProps}
        >
          <TextInput
            validated={helperProps.variant}
            isRequired={requiredFields.includes(id)}
            isDisabled={disabledFields.includes(id)}
            id={id}
            type='text'
            value={value || ''}
            onChange={(_event, value) => this.updateRemote(value, id)}
            {...textInputProps}
          />
          <FormFieldHelper {...helperProps} />
        </FormGroup>
      );
    };

    return (
      <Form>
        {textField({ id: 'name', label: t`Name`, value: remote.name })}
        {textField(
          { id: 'url', label: t`URL`, value: remote.url },
          {
            labelIcon: (
              <HelperPopover
                content={t`The URL of an external content source.`}
              />
            ),
          },
          {},
          validateURLHelper(errorMessages['url'], remote.url),
        )}

        {!disabledFields.includes('signed_only') && collection_signing ? (
          <FormGroup
            fieldId={'signed_only'}
            name={t`Signed only` /* TODO name? */}
            label={t`Download only signed collections`}
          >
            <Switch
              id='signed_only'
              isChecked={!!remote.signed_only}
              onChange={(_event, value) =>
                this.updateRemote(value, 'signed_only')
              }
            />
          </FormGroup>
        ) : null}

        {!disabledFields.includes('token') && (
          <FormGroup
            fieldId={'token'}
            label={t`Token`}
            labelIcon={
              <HelperPopover
                content={t`Token for authenticating to the server URL.`}
              />
            }
            isRequired={requiredFields.includes('token')}
          >
            <WriteOnlyField
              isValueSet={isFieldSet('token', writeOnlyFields)}
              onClear={() => this.updateIsSet('token', false)}
            >
              <TextInput
                validated={toError(!('token' in errorMessages))}
                isRequired={requiredFields.includes('token')}
                type='password'
                autoComplete='off'
                id='token'
                value={remote.token || ''}
                onChange={(_event, value) => this.updateRemote(value, 'token')}
              />
            </WriteOnlyField>
            <FormFieldHelper variant={toError(!('token' in errorMessages))}>
              {errorMessages['token']}
            </FormFieldHelper>
          </FormGroup>
        )}

        {!disabledFields.includes('auth_url') &&
          textField(
            { id: 'auth_url', label: t`SSO URL`, value: remote.auth_url },
            {
              labelIcon: <HelperPopover content={t`Single sign on URL.`} />,
            },
          )}

        {!disabledFields.includes('requirements_file') && (
          <FormGroup
            fieldId={'yaml'}
            label={t`YAML requirements`}
            labelIcon={
              <HelperPopover
                content={
                  <Trans>
                    This uses the same {docsAnsibleLink} format as the
                    ansible-galaxy CLI with the caveat that roles aren&apos;t
                    supported and the source parameter is not supported.
                  </Trans>
                }
              />
            }
            isRequired={requiredFields.includes('requirements_file')}
          >
            <Flex>
              <FlexItem grow={{ default: 'grow' }}>
                <FileUpload
                  validated={toError(!('requirements_file' in errorMessages))}
                  isRequired={requiredFields.includes('requirements_file')}
                  id='yaml'
                  filename={filename('requirements_file')}
                  value={this.props.remote.requirements_file || ''}
                  hideDefaultPreview
                  onChange={fileOnChange('requirements_file')}
                />
              </FlexItem>
              <FlexItem>
                <Button
                  isDisabled={!this.props.remote.requirements_file}
                  onClick={() =>
                    downloadString(
                      this.props.remote.requirements_file,
                      filenames.requirements_file.name,
                    )
                  }
                  variant='plain'
                  aria-label={t`Download requirements file`}
                >
                  <DownloadIcon />
                </Button>
              </FlexItem>
            </Flex>
            <ExpandableSection
              toggleTextExpanded={t`Close YAML editor`}
              toggleTextCollapsed={t`Edit in YAML editor`}
            >
              <Flex>
                <FlexItem grow={{ default: 'grow' }}>
                  <ExclamationTriangleIcon />{' '}
                  {t`If you populate this requirements file, this remote will only sync collections from this file, otherwise all collections will be synchronized.`}
                  <CodeEditor
                    code={this.props.remote.requirements_file}
                    isCopyEnabled
                    isDarkTheme
                    isDownloadEnabled
                    isLanguageLabelVisible
                    isUploadEnabled
                    emptyState={
                      <>
                        <pre>{yamlTemplate}</pre>
                        <Button
                          variant='plain'
                          onClick={() =>
                            this.updateRemote(yamlTemplate, 'requirements_file')
                          }
                        >{t`Use template`}</Button>
                        <Button
                          variant='plain'
                          onClick={() =>
                            this.updateRemote('\n', 'requirements_file')
                          }
                        >{t`Start from scratch`}</Button>
                      </>
                    }
                    height='20rem'
                    language={Language.yaml}
                    onChange={(value) =>
                      this.updateRemote(value, 'requirements_file')
                    }
                    onEditorDidMount={(editor) => editor.focus()}
                  />
                </FlexItem>
              </Flex>
            </ExpandableSection>
            <FormFieldHelper
              variant={toError(!('requirements_file' in errorMessages))}
            >
              {errorMessages['requirements_file']}
            </FormFieldHelper>
          </FormGroup>
        )}

        <FormGroup
          data-cy='username'
          fieldId={'username'}
          label={t`Username`}
          labelIcon={
            <HelperPopover
              content={
                disabledFields.includes('token')
                  ? t`The username to be used for authentication when syncing.`
                  : t`The username to be used for authentication when syncing. This is not required when using a token.`
              }
            />
          }
          isRequired={requiredFields.includes('username')}
        >
          <WriteOnlyField
            isValueSet={
              isWriteOnly('username', writeOnlyFields) &&
              isFieldSet('username', writeOnlyFields)
            }
            onClear={() => this.updateIsSet('username', false)}
          >
            <TextInput
              validated={toError(!('username' in errorMessages))}
              isRequired={requiredFields.includes('username')}
              isDisabled={disabledFields.includes('username')}
              id='username'
              type='text'
              value={remote.username || ''}
              onChange={(_event, value) => this.updateRemote(value, 'username')}
            />
          </WriteOnlyField>
          <FormFieldHelper variant={toError(!('username' in errorMessages))}>
            {errorMessages['username']}
          </FormFieldHelper>
        </FormGroup>

        <FormGroup
          data-cy='password'
          fieldId={'password'}
          label={t`Password`}
          labelIcon={
            <HelperPopover
              content={
                disabledFields.includes('token')
                  ? t`The password to be used for authentication when syncing.`
                  : t`The password to be used for authentication when syncing. This is not required when using a token.`
              }
            />
          }
          isRequired={requiredFields.includes('password')}
        >
          <WriteOnlyField
            isValueSet={isFieldSet('password', writeOnlyFields)}
            onClear={() => this.updateIsSet('password', false)}
          >
            <TextInput
              validated={toError(!('password' in errorMessages))}
              isRequired={requiredFields.includes('password')}
              isDisabled={disabledFields.includes('password')}
              id='password'
              type='password'
              autoComplete='off'
              value={remote.password || ''}
              onChange={(_event, value) => this.updateRemote(value, 'password')}
            />
          </WriteOnlyField>
          <FormFieldHelper variant={toError(!('password' in errorMessages))}>
            {errorMessages['password']}
          </FormFieldHelper>
        </FormGroup>

        <ExpandableSection
          toggleTextExpanded={t`Hide advanced options`}
          toggleTextCollapsed={t`Show advanced options`}
        >
          <div className='pf-c-form'>
            {textField({
              id: 'proxy_url',
              label: t`Proxy URL`,
              value: remote.proxy_url,
            })}

            <FormGroup
              data-cy='proxy_username'
              fieldId={'proxy_username'}
              label={t`Proxy username`}
              isRequired={requiredFields.includes('proxy_username')}
            >
              <WriteOnlyField
                isValueSet={
                  isWriteOnly('proxy_username', writeOnlyFields) &&
                  isFieldSet('proxy_username', writeOnlyFields)
                }
                onClear={() => this.updateIsSet('proxy_username', false)}
              >
                <TextInput
                  validated={toError(!('proxy_username' in errorMessages))}
                  isRequired={requiredFields.includes('proxy_username')}
                  isDisabled={disabledFields.includes('proxy_username')}
                  id='proxy_username'
                  type='text'
                  value={remote.proxy_username || ''}
                  onChange={(_event, value) =>
                    this.updateRemote(value, 'proxy_username')
                  }
                />
              </WriteOnlyField>
              <FormFieldHelper
                variant={toError(!('proxy_username' in errorMessages))}
              >
                {errorMessages['proxy_username']}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              data-cy='proxy_password'
              fieldId={'proxy_password'}
              label={t`Proxy password`}
              isRequired={requiredFields.includes('proxy_password')}
            >
              <WriteOnlyField
                isValueSet={isFieldSet('proxy_password', writeOnlyFields)}
                onClear={() => this.updateIsSet('proxy_password', false)}
              >
                <TextInput
                  validated={toError(!('proxy_password' in errorMessages))}
                  isRequired={requiredFields.includes('proxy_password')}
                  isDisabled={disabledFields.includes('proxy_password')}
                  id='proxy_password'
                  type='password'
                  autoComplete='off'
                  value={remote.proxy_password || ''}
                  onChange={(_event, value) =>
                    this.updateRemote(value, 'proxy_password')
                  }
                />
              </WriteOnlyField>
              <FormFieldHelper
                variant={toError(!('proxy_password' in errorMessages))}
              >
                {errorMessages['proxy_password']}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              fieldId={'tls_validation'}
              label={t`TLS validation`}
              labelIcon={
                <HelperPopover
                  content={t`If selected, TLS peer validation must be performed.`}
                />
              }
              isRequired={requiredFields.includes('tls_validation')}
            >
              <Checkbox
                onChange={(_event, value) =>
                  this.updateRemote(value, 'tls_validation')
                }
                id='tls_validation'
                isChecked={remote.tls_validation}
              />
              <FormFieldHelper
                variant={toError(!('tls_validation' in errorMessages))}
              >
                {errorMessages['tls_validation']}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              fieldId={'client_key'}
              label={t`Client key`}
              labelIcon={
                <HelperPopover
                  content={t`A PEM encoded private key used for authentication.`}
                />
              }
              isRequired={requiredFields.includes('client_key')}
            >
              <WriteOnlyField
                isValueSet={isFieldSet('client_key', writeOnlyFields)}
                onClear={() => this.updateIsSet('client_key', false)}
              >
                <FileUpload
                  data-cy='client_key'
                  validated={toError(!('client_key' in errorMessages))}
                  isRequired={requiredFields.includes('client_key')}
                  id='yaml'
                  filename={filename('client_key')}
                  value={this.props.remote.client_key || ''}
                  hideDefaultPreview
                  onChange={fileOnChange('client_key')}
                />
              </WriteOnlyField>
              <FormFieldHelper
                variant={toError(!('client_key' in errorMessages))}
              >
                {errorMessages['client_key']}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              fieldId={'client_cert'}
              label={t`Client certificate`}
              labelIcon={
                <HelperPopover
                  content={t`A PEM encoded client certificate used for authentication.`}
                />
              }
              isRequired={requiredFields.includes('client_cert')}
            >
              <Flex>
                <FlexItem grow={{ default: 'grow' }}>
                  <FileUpload
                    validated={toError(!('client_cert' in errorMessages))}
                    isRequired={requiredFields.includes('client_cert')}
                    id='yaml'
                    filename={filename('client_cert')}
                    value={this.props.remote.client_cert || ''}
                    hideDefaultPreview
                    onChange={fileOnChange('client_cert')}
                  />
                </FlexItem>
                <FlexItem>
                  <Button
                    data-cy='client_cert'
                    isDisabled={!this.props.remote.client_cert}
                    onClick={() =>
                      downloadString(
                        this.props.remote.client_cert,
                        filenames.client_cert.name,
                      )
                    }
                    variant='plain'
                    aria-label={t`Download client certification file`}
                  >
                    <DownloadIcon />
                  </Button>
                </FlexItem>
              </Flex>
              <FormFieldHelper
                variant={toError(!('client_cert' in errorMessages))}
              >
                {errorMessages['client_cert']}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              fieldId={'ca_cert'}
              label={t`CA certificate`}
              labelIcon={
                <HelperPopover
                  content={t`A PEM encoded client certificate used for authentication.`}
                />
              }
              isRequired={requiredFields.includes('ca_cert')}
            >
              <Flex>
                <FlexItem grow={{ default: 'grow' }}>
                  <FileUpload
                    validated={toError(!('ca_cert' in errorMessages))}
                    isRequired={requiredFields.includes('ca_cert')}
                    id='yaml'
                    filename={filename('ca_cert')}
                    value={this.props.remote.ca_cert || ''}
                    hideDefaultPreview
                    onChange={fileOnChange('ca_cert')}
                  />
                </FlexItem>
                <FlexItem>
                  <Button
                    data-cy='ca_cert'
                    isDisabled={!this.props.remote.ca_cert}
                    onClick={() =>
                      downloadString(
                        this.props.remote.ca_cert,
                        filenames.ca_cert.name,
                      )
                    }
                    variant='plain'
                    aria-label={t`Download CA certification file`}
                  >
                    <DownloadIcon />
                  </Button>
                </FlexItem>
              </Flex>
              <FormFieldHelper variant={toError(!('ca_cert' in errorMessages))}>
                {errorMessages['ca_cert']}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              fieldId={'download_concurrency'}
              label={t`Download concurrency`}
              labelIcon={
                <HelperPopover
                  content={t`Total number of simultaneous connections.`}
                />
              }
            >
              <TextInput
                id='download_concurrency'
                type='number'
                value={remote.download_concurrency || ''}
                validated={
                  !this.isNumericSet(remote.download_concurrency) ||
                  remote.download_concurrency > 0
                    ? 'default'
                    : 'error'
                }
                onChange={(_event, value) =>
                  this.updateRemote(value, 'download_concurrency')
                }
              />
              <FormFieldHelper
                variant={
                  !this.isNumericSet(remote.download_concurrency) ||
                  remote.download_concurrency > 0
                    ? 'default'
                    : 'error'
                }
              >
                {t`Number must be greater than 0`}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              fieldId={'rate_limit'}
              label={t`Rate Limit`}
              labelIcon={
                <HelperPopover
                  content={t`Limits total download rate in requests per second.`}
                />
              }
            >
              <TextInput
                id='rate_limit'
                type='number'
                value={remote.rate_limit || ''}
                onChange={(_event, value) =>
                  this.updateRemote(value, 'rate_limit')
                }
              />
              <FormFieldHelper
                variant={
                  !this.isNumericSet(remote.rate_limit) ||
                  Number.isInteger(remote.rate_limit)
                    ? 'default'
                    : 'error'
                }
              >
                {t`Must be an integer.`}
              </FormFieldHelper>
            </FormGroup>
          </div>
        </ExpandableSection>
        {errorMessages['__nofield'] ? (
          <span
            style={{
              color: 'var(--pf-global--danger-color--200)',
            }}
          >
            {errorMessages['__nofield']}
          </span>
        ) : null}
        {extra}
      </Form>
    );
  }

  private isValid(requiredFields) {
    const { remote, remoteType } = this.props;

    for (const field of requiredFields) {
      if (!remote[field] || remote[field] === '') {
        return false;
      }
    }

    if (remoteType === 'ansible-remote') {
      // only required in remotes, not registries
      if (remote.download_concurrency < 1) {
        return false;
      }
    }

    if (validateURLHelper(null, remote.url).variant == 'error') {
      return false;
    }

    return true;
  }

  private updateIsSet(fieldName: string, value: boolean) {
    const { remote, remoteType } = this.props;
    const hiddenFieldsName =
      remoteType === 'ansible-remote' ? 'hidden_fields' : 'write_only_fields';

    const newFields: WriteOnlyFieldType[] = remote[hiddenFieldsName].map(
      (field) =>
        field.name === fieldName ? { ...field, is_set: value } : field,
    );

    this.props.updateRemote({
      ...remote,
      [fieldName]: null,
      [hiddenFieldsName]: newFields,
    });
  }

  private updateRemote(value, field) {
    const { remote } = this.props;

    const numericFields = ['download_concurrency', 'rate_limit'];
    if (numericFields.includes(field)) {
      value = Number.isInteger(value)
        ? value
        : Number.isNaN(parseInt(value, 10))
        ? null
        : parseInt(value, 10);
    }

    this.props.updateRemote({ ...remote, [field]: value });
  }

  private isNumericSet(value) {
    return value != null && value !== '';
  }
}
