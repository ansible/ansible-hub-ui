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
import {
  DownloadIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import React from 'react';
import { RemoteType, WriteOnlyFieldType } from 'src/api';
import { FileUpload, HelperText, WriteOnlyField } from 'src/components';
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

type FormFilename = {
  name: string;
  original: boolean;
};

interface IState {
  filenames: {
    requirements_file: FormFilename;
    client_key: FormFilename;
    client_cert: FormFilename;
    ca_cert: FormFilename;
  };
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
    const fileOnChange = (field) => (value, name) => {
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

    return (
      <Form>
        <FormGroup
          fieldId={'name'}
          label={t`Name`}
          isRequired={requiredFields.includes('name')}
          validated={this.toError(!('name' in errorMessages))}
          helperTextInvalid={errorMessages['name']}
        >
          <TextInput
            validated={this.toError(!('name' in errorMessages))}
            isRequired={requiredFields.includes('name')}
            isDisabled={disabledFields.includes('name')}
            id='name'
            type='text'
            value={remote.name || ''}
            onChange={(value) => this.updateRemote(value, 'name')}
          />
        </FormGroup>

        <FormGroup
          fieldId={'url'}
          label={t`URL`}
          labelIcon={
            <HelperText content={t`The URL of an external content source.`} />
          }
          isRequired={requiredFields.includes('url')}
          {...validateURLHelper(errorMessages['url'], remote.url)}
          helperTextIcon={<ExclamationTriangleIcon />}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
        >
          <TextInput
            validated={
              validateURLHelper(errorMessages['url'], remote.url).validated
            }
            isRequired={requiredFields.includes('url')}
            isDisabled={disabledFields.includes('url')}
            id='url'
            type='text'
            value={remote.url || ''}
            onChange={(value) => this.updateRemote(value, 'url')}
          />
        </FormGroup>

        {!disabledFields.includes('signed_only') && collection_signing ? (
          <FormGroup
            fieldId={'signed_only'}
            name={t`Signed only`}
            label={t`Download only signed collections`}
          >
            <Switch
              id='signed_only'
              isChecked={!!remote.signed_only}
              onChange={(value) => this.updateRemote(value, 'signed_only')}
            />
          </FormGroup>
        ) : null}

        {!disabledFields.includes('token') && (
          <FormGroup
            fieldId={'token'}
            label={t`Token`}
            labelIcon={
              <HelperText
                content={t`Token for authenticating to the server URL.`}
              />
            }
            isRequired={requiredFields.includes('token')}
            validated={this.toError(!('token' in errorMessages))}
            helperTextInvalid={errorMessages['token']}
          >
            <WriteOnlyField
              isValueSet={isFieldSet('token', writeOnlyFields)}
              onClear={() => this.updateIsSet('token', false)}
            >
              <TextInput
                validated={this.toError(!('token' in errorMessages))}
                isRequired={requiredFields.includes('token')}
                type='password'
                id='token'
                value={remote.token || ''}
                onChange={(value) => this.updateRemote(value, 'token')}
              />
            </WriteOnlyField>
          </FormGroup>
        )}

        {!disabledFields.includes('auth_url') && (
          <FormGroup
            fieldId={'auth_url'}
            label={t`SSO URL`}
            labelIcon={<HelperText content={t`Single sign on URL.`} />}
            isRequired={requiredFields.includes('auth_url')}
            validated={this.toError(!('auth_url' in errorMessages))}
            helperTextInvalid={errorMessages['auth_url']}
          >
            <TextInput
              validated={this.toError(!('auth_url' in errorMessages))}
              isRequired={requiredFields.includes('auth_url')}
              id='ssoUrl'
              type='text'
              value={this.props.remote.auth_url || ''}
              onChange={(value) => this.updateRemote(value, 'auth_url')}
            />
          </FormGroup>
        )}

        {!disabledFields.includes('requirements_file') && (
          <FormGroup
            fieldId={'yaml'}
            label={t`YAML requirements`}
            labelIcon={
              <HelperText
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
            validated={this.toError(!('requirements_file' in errorMessages))}
            helperTextInvalid={errorMessages['requirements_file']}
          >
            <Flex>
              <FlexItem grow={{ default: 'grow' }}>
                <FileUpload
                  validated={this.toError(
                    !('requirements_file' in errorMessages),
                  )}
                  isRequired={requiredFields.includes('requirements_file')}
                  id='yaml'
                  type='text'
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
          </FormGroup>
        )}

        <FormGroup
          data-cy='username'
          fieldId={'username'}
          label={t`Username`}
          labelIcon={
            <HelperText
              content={
                disabledFields.includes('token')
                  ? t`The username to be used for authentication when syncing.`
                  : t`The username to be used for authentication when syncing. This is not required when using a token.`
              }
            />
          }
          isRequired={requiredFields.includes('username')}
          validated={this.toError(!('username' in errorMessages))}
          helperTextInvalid={errorMessages['username']}
        >
          <WriteOnlyField
            isValueSet={
              isWriteOnly('username', writeOnlyFields) &&
              isFieldSet('username', writeOnlyFields)
            }
            onClear={() => this.updateIsSet('username', false)}
          >
            <TextInput
              validated={this.toError(!('username' in errorMessages))}
              isRequired={requiredFields.includes('username')}
              isDisabled={disabledFields.includes('username')}
              id='username'
              type='text'
              value={remote.username || ''}
              onChange={(value) => this.updateRemote(value, 'username')}
            />
          </WriteOnlyField>
        </FormGroup>

        <FormGroup
          data-cy='password'
          fieldId={'password'}
          label={t`Password`}
          labelIcon={
            <HelperText
              content={
                disabledFields.includes('token')
                  ? t`The password to be used for authentication when syncing.`
                  : t`The password to be used for authentication when syncing. This is not required when using a token.`
              }
            />
          }
          isRequired={requiredFields.includes('password')}
          validated={this.toError(!('password' in errorMessages))}
          helperTextInvalid={errorMessages['password']}
        >
          <WriteOnlyField
            isValueSet={isFieldSet('password', writeOnlyFields)}
            onClear={() => this.updateIsSet('password', false)}
          >
            <TextInput
              validated={this.toError(!('password' in errorMessages))}
              isRequired={requiredFields.includes('password')}
              isDisabled={disabledFields.includes('password')}
              id='password'
              type='password'
              value={remote.password || ''}
              onChange={(value) => this.updateRemote(value, 'password')}
            />
          </WriteOnlyField>
        </FormGroup>

        <ExpandableSection
          toggleTextExpanded={t`Hide advanced options`}
          toggleTextCollapsed={t`Show advanced options`}
        >
          <div className='pf-c-form'>
            <FormGroup
              fieldId={'proxy_url'}
              label={t`Proxy URL`}
              isRequired={requiredFields.includes('proxy_url')}
              validated={this.toError(!('proxy_url' in errorMessages))}
              helperTextInvalid={errorMessages['proxy_url']}
            >
              <TextInput
                validated={this.toError(!('proxy_url' in errorMessages))}
                isRequired={requiredFields.includes('proxy_url')}
                isDisabled={disabledFields.includes('proxy_url')}
                id='proxy_url'
                type='text'
                value={remote.proxy_url || ''}
                onChange={(value) => this.updateRemote(value, 'proxy_url')}
              />
            </FormGroup>

            <FormGroup
              data-cy='proxy_username'
              fieldId={'proxy_username'}
              label={t`Proxy username`}
              isRequired={requiredFields.includes('proxy_username')}
              validated={this.toError(!('proxy_username' in errorMessages))}
              helperTextInvalid={errorMessages['proxy_username']}
            >
              <WriteOnlyField
                isValueSet={
                  isWriteOnly('proxy_username', writeOnlyFields) &&
                  isFieldSet('proxy_username', writeOnlyFields)
                }
                onClear={() => this.updateIsSet('proxy_username', false)}
              >
                <TextInput
                  validated={this.toError(!('proxy_username' in errorMessages))}
                  isRequired={requiredFields.includes('proxy_username')}
                  isDisabled={disabledFields.includes('proxy_username')}
                  id='proxy_username'
                  type='text'
                  value={remote.proxy_username || ''}
                  onChange={(value) =>
                    this.updateRemote(value, 'proxy_username')
                  }
                />
              </WriteOnlyField>
            </FormGroup>

            <FormGroup
              data-cy='proxy_password'
              fieldId={'proxy_password'}
              label={t`Proxy password`}
              isRequired={requiredFields.includes('proxy_password')}
              validated={this.toError(!('proxy_password' in errorMessages))}
              helperTextInvalid={errorMessages['proxy_password']}
            >
              <WriteOnlyField
                isValueSet={isFieldSet('proxy_password', writeOnlyFields)}
                onClear={() => this.updateIsSet('proxy_password', false)}
              >
                <TextInput
                  validated={this.toError(!('proxy_password' in errorMessages))}
                  isRequired={requiredFields.includes('proxy_password')}
                  isDisabled={disabledFields.includes('proxy_password')}
                  id='proxy_password'
                  type='password'
                  value={remote.proxy_password || ''}
                  onChange={(value) =>
                    this.updateRemote(value, 'proxy_password')
                  }
                />
              </WriteOnlyField>
            </FormGroup>

            <FormGroup
              fieldId={'tls_validation'}
              label={t`TLS validation`}
              labelIcon={
                <HelperText
                  content={t`If selected, TLS peer validation must be performed.`}
                />
              }
              isRequired={requiredFields.includes('tls_validation')}
              validated={this.toError(!('tls_validation' in errorMessages))}
              helperTextInvalid={errorMessages['tls_validation']}
            >
              <Checkbox
                onChange={(value) => this.updateRemote(value, 'tls_validation')}
                id='tls_validation'
                isChecked={remote.tls_validation}
              />
            </FormGroup>

            <FormGroup
              fieldId={'client_key'}
              label={t`Client key`}
              labelIcon={
                <HelperText
                  content={t`A PEM encoded private key used for authentication.`}
                />
              }
              isRequired={requiredFields.includes('client_key')}
              validated={this.toError(!('client_key' in errorMessages))}
              helperTextInvalid={errorMessages['client_key']}
            >
              <WriteOnlyField
                isValueSet={isFieldSet('client_key', writeOnlyFields)}
                onClear={() => this.updateIsSet('client_key', false)}
              >
                <FileUpload
                  data-cy='client_key'
                  validated={this.toError(!('client_key' in errorMessages))}
                  isRequired={requiredFields.includes('client_key')}
                  id='yaml'
                  type='text'
                  filename={filename('client_key')}
                  value={this.props.remote.client_key || ''}
                  hideDefaultPreview
                  onChange={fileOnChange('client_key')}
                />
              </WriteOnlyField>
            </FormGroup>

            <FormGroup
              fieldId={'client_cert'}
              label={t`Client certificate`}
              labelIcon={
                <HelperText
                  content={t`A PEM encoded client certificate used for authentication.`}
                />
              }
              isRequired={requiredFields.includes('client_cert')}
              validated={this.toError(!('client_cert' in errorMessages))}
              helperTextInvalid={errorMessages['client_cert']}
            >
              <Flex>
                <FlexItem grow={{ default: 'grow' }}>
                  <FileUpload
                    validated={this.toError(!('client_cert' in errorMessages))}
                    isRequired={requiredFields.includes('client_cert')}
                    id='yaml'
                    type='text'
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
            </FormGroup>

            <FormGroup
              fieldId={'ca_cert'}
              label={t`CA certificate`}
              labelIcon={
                <HelperText
                  content={t`A PEM encoded client certificate used for authentication.`}
                />
              }
              isRequired={requiredFields.includes('ca_cert')}
              validated={this.toError(!('ca_cert' in errorMessages))}
              helperTextInvalid={errorMessages['ca_cert']}
            >
              <Flex>
                <FlexItem grow={{ default: 'grow' }}>
                  <FileUpload
                    validated={this.toError(!('ca_cert' in errorMessages))}
                    isRequired={requiredFields.includes('ca_cert')}
                    id='yaml'
                    type='text'
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
            </FormGroup>

            <FormGroup
              fieldId={'download_concurrency'}
              label={t`Download concurrency`}
              labelIcon={
                <HelperText
                  content={t`Total number of simultaneous connections.`}
                />
              }
              validated={
                !this.isNumericSet(remote.download_concurrency) ||
                remote.download_concurrency > 0
                  ? 'default'
                  : 'error'
              }
              helperTextInvalid={t`Number must be greater than 0`}
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
                onChange={(value) =>
                  this.updateRemote(value, 'download_concurrency')
                }
              />
            </FormGroup>

            <FormGroup
              fieldId={'rate_limit'}
              label={t`Rate Limit`}
              labelIcon={
                <HelperText
                  content={t`Limits total download rate in requests per second.`}
                />
              }
              validated={
                !this.isNumericSet(remote.rate_limit) ||
                Number.isInteger(remote.rate_limit)
                  ? 'default'
                  : 'error'
              }
              helperTextInvalid={t`Must be an integer.`}
            >
              <TextInput
                id='rate_limit'
                type='number'
                value={remote.rate_limit || ''}
                onChange={(value) => this.updateRemote(value, 'rate_limit')}
              />
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

    if (validateURLHelper(null, remote.url).validated == 'error') {
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

  private toError(validated: boolean) {
    if (validated) {
      return 'default';
    } else {
      return 'error';
    }
  }

  private isNumericSet(value) {
    return value != null && value !== '';
  }
}
