import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import * as FileSaver from 'file-saver';

import {
  Form,
  FormGroup,
  TextInput,
  Flex,
  FlexItem,
  Button,
  Modal,
  Checkbox,
  ExpandableSection,
} from '@patternfly/react-core';

import { WriteOnlyField, HelperText, FileUpload } from 'src/components';

import { DownloadIcon } from '@patternfly/react-icons';

import { RemoteType, WriteOnlyFieldType } from 'src/api';
import { Constants } from 'src/constants';
import { isFieldSet, isWriteOnly } from 'src/utilities';

interface IProps {
  allowEditName?: boolean;
  closeModal: () => void;
  errorMessages: object;
  remote: RemoteType;
  remoteType?: 'registry';
  saveRemote: () => void;
  showModal: boolean;
  title?: string;
  updateRemote: (remote) => void;
}

interface IState {
  uploadedRequirementFilename: string;
  uploadedClientKeyFilename: string;
  uploadedClientCertFilename: string;
  uploadedCaCertFilename: string;
}

export class RemoteForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    let [
      requirementsFilename,
      clientCertFilename,
      clientKeyFilename,
      caCertFilename,
    ] = Array(4).fill('');

    if (!!props.remote) {
      requirementsFilename = this.props.remote.requirements_file
        ? 'requirements.yml'
        : '';
      clientKeyFilename = this.props.remote.client_key ? 'client_key.yml' : '';
      clientCertFilename = this.props.remote.client_cert
        ? 'client_cert.yml'
        : '';
      caCertFilename = this.props.remote.ca_cert ? 'ca_cert.yml' : '';
    }

    this.state = {
      uploadedRequirementFilename: requirementsFilename,
      uploadedClientKeyFilename: clientKeyFilename,
      uploadedClientCertFilename: clientCertFilename,
      uploadedCaCertFilename: caCertFilename,
    };
  }

  render() {
    const { remote, errorMessages } = this.props;
    if (!remote) {
      return null;
    }

    const remoteType = this.props.remoteType || this.getRemoteType(remote.url);

    let requiredFields = ['name', 'url'];
    let disabledFields = this.props.allowEditName ? [] : ['name'];

    if (remoteType === 'certified') {
      requiredFields = requiredFields.concat(['auth_url']);
      disabledFields = disabledFields.concat(['requirements_file']);
    }

    if (remoteType === 'community') {
      requiredFields = requiredFields.concat(['requirements_file']);
      disabledFields = disabledFields.concat(['auth_url', 'token']);
    }

    if (remoteType === 'registry') {
      disabledFields = disabledFields.concat([
        'auth_url',
        'token',
        'requirements_file',
      ]);
    }

    return (
      <Modal
        isOpen={this.props.showModal}
        title={this.props.title || t`Edit remote`}
        variant='small'
        onClose={() => this.props.closeModal()}
        actions={[
          <Button
            isDisabled={!this.isValid(requiredFields, remoteType)}
            key='confirm'
            variant='primary'
            onClick={() => this.props.saveRemote()}
          >
            {t`Save`}
          </Button>,
          <Button
            key='cancel'
            variant='secondary'
            onClick={() => this.props.closeModal()}
          >
            {t`Cancel`}
          </Button>,
        ]}
      >
        {this.renderForm(requiredFields, disabledFields)}
      </Modal>
    );
  }

  private renderForm(requiredFields, disabledFields) {
    const { remote, errorMessages } = this.props;
    const docsAnsibleLink = (
      <a
        target='_blank'
        href='https://docs.ansible.com/ansible/latest/user_guide/collections_using.html#install-multiple-collections-with-a-requirements-file'
      >
        requirements.yml
      </a>
    );
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
          validated={this.toError(!('url' in errorMessages))}
          helperTextInvalid={errorMessages['url']}
        >
          <TextInput
            validated={this.toError(!('url' in errorMessages))}
            isRequired={requiredFields.includes('url')}
            isDisabled={disabledFields.includes('url')}
            id='url'
            type='text'
            value={remote.url || ''}
            onChange={(value) => this.updateRemote(value, 'url')}
          />
        </FormGroup>

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
              isValueSet={isFieldSet('token', remote.write_only_fields)}
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
                    ansible-galaxy CLI with the caveat that roles aren't
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
                  filename={this.state.uploadedRequirementFilename}
                  value={this.props.remote.requirements_file || ''}
                  hideDefaultPreview
                  onChange={(value, filename) => {
                    this.setState(
                      { uploadedRequirementFilename: filename },
                      () => this.updateRemote(value, 'requirements_file'),
                    );
                  }}
                />
              </FlexItem>
              <FlexItem>
                <Button
                  isDisabled={!this.props.remote.requirements_file}
                  onClick={() => {
                    FileSaver.saveAs(
                      new Blob([this.props.remote.requirements_file], {
                        type: 'text/plain;charset=utf-8',
                      }),
                      this.state.uploadedRequirementFilename,
                    );
                  }}
                  variant='plain'
                  aria-label={t`Download requirements file`}
                >
                  <DownloadIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FormGroup>
        )}

        <FormGroup
          fieldId={'username'}
          label={t`Username`}
          labelIcon={
            <HelperText
              content={t`The username to be used for authentication when syncing. This is not required when using a token.`}
            />
          }
          isRequired={requiredFields.includes('username')}
          validated={this.toError(!('username' in errorMessages))}
          helperTextInvalid={errorMessages['username']}
        >
          <WriteOnlyField
            isValueSet={
              isWriteOnly('username', remote.write_only_fields) &&
              isFieldSet('username', remote.write_only_fields)
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
          fieldId={'password'}
          label={t`Password`}
          labelIcon={
            <HelperText
              content={t`The password to be used for authentication when syncing. This is not required when using a token.`}
            />
          }
          isRequired={requiredFields.includes('password')}
          validated={this.toError(!('password' in errorMessages))}
          helperTextInvalid={errorMessages['password']}
        >
          <WriteOnlyField
            isValueSet={isFieldSet('password', remote.write_only_fields)}
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
              fieldId={'proxy_username'}
              label={t`Proxy username`}
              isRequired={requiredFields.includes('proxy_username')}
              validated={this.toError(!('proxy_username' in errorMessages))}
              helperTextInvalid={errorMessages['proxy_username']}
            >
              <WriteOnlyField
                isValueSet={
                  isWriteOnly('proxy_username', remote.write_only_fields) &&
                  isFieldSet('proxy_username', remote.write_only_fields)
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
              fieldId={'proxy_password'}
              label={t`Proxy password`}
              isRequired={requiredFields.includes('proxy_password')}
              validated={this.toError(!('proxy_password' in errorMessages))}
              helperTextInvalid={errorMessages['proxy_password']}
            >
              <WriteOnlyField
                isValueSet={isFieldSet(
                  'proxy_password',
                  remote.write_only_fields,
                )}
                onClear={() => this.updateIsSet('proxy_password', false)}
              >
                <TextInput
                  validated={this.toError(!('proxy_password' in errorMessages))}
                  isRequired={requiredFields.includes('proxy_password')}
                  isDisabled={disabledFields.includes('proxy_password')}
                  id='proxy_password'
                  type='text'
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
                isValueSet={isFieldSet('client_key', remote.write_only_fields)}
                onClear={() => this.updateIsSet('client_key', false)}
              >
                <FileUpload
                  validated={this.toError(!('client_key' in errorMessages))}
                  isRequired={requiredFields.includes('client_key')}
                  id='yaml'
                  type='text'
                  filename={this.state.uploadedClientKeyFilename}
                  value={this.props.remote.client_key || ''}
                  hideDefaultPreview
                  onChange={(value, filename) => {
                    this.setState({ uploadedClientKeyFilename: filename }, () =>
                      this.updateRemote(value, 'client_key'),
                    );
                  }}
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
                    filename={this.state.uploadedClientCertFilename}
                    value={this.props.remote.client_cert || ''}
                    hideDefaultPreview
                    onChange={(value, filename) => {
                      this.setState(
                        { uploadedClientCertFilename: filename },
                        () => this.updateRemote(value, 'client_cert'),
                      );
                    }}
                  />
                </FlexItem>
                <FlexItem>
                  <Button
                    isDisabled={!this.props.remote.client_cert}
                    onClick={() => {
                      FileSaver.saveAs(
                        new Blob([this.props.remote.client_cert], {
                          type: 'text/plain;charset=utf-8',
                        }),
                        this.state.uploadedClientCertFilename,
                      );
                    }}
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
                    filename={this.state.uploadedCaCertFilename}
                    value={this.props.remote.ca_cert || ''}
                    hideDefaultPreview
                    onChange={(value, filename) => {
                      this.setState({ uploadedCaCertFilename: filename }, () =>
                        this.updateRemote(value, 'ca_cert'),
                      );
                    }}
                  />
                </FlexItem>
                <FlexItem>
                  <Button
                    isDisabled={!this.props.remote.ca_cert}
                    onClick={() => {
                      FileSaver.saveAs(
                        new Blob([this.props.remote.ca_cert], {
                          type: 'text/plain;charset=utf-8',
                        }),
                        this.state.uploadedCaCertFilename,
                      );
                    }}
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
                value={remote.download_concurrency}
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
                value={remote.rate_limit}
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
      </Form>
    );
  }

  private isValid(requiredFields, remoteType) {
    const { remote } = this.props;

    for (const field of requiredFields) {
      if (!remote[field] || remote[field] === '') {
        return false;
      }
    }

    if (['community', 'certified', 'none'].includes(remoteType)) {
      // only required in remotes, not registries
      if (remote.download_concurrency < 1) {
        return false;
      }
    }

    return true;
  }

  private getRemoteType(url: string): 'community' | 'certified' | 'none' {
    for (const host of Constants.UPSTREAM_HOSTS) {
      if (url.includes(host)) {
        return 'community';
      }
    }

    for (const host of Constants.DOWNSTREAM_HOSTS) {
      if (url.includes(host)) {
        return 'certified';
      }
    }

    return 'none';
  }

  private updateIsSet(fieldName: string, value: boolean) {
    const writeOnlyFields = this.props.remote.write_only_fields;
    const newFields: WriteOnlyFieldType[] = [];

    for (const field of writeOnlyFields) {
      if (field.name === fieldName) {
        field.is_set = value;
      }

      newFields.push(field);
    }

    const update = { ...this.props.remote };
    update.write_only_fields = newFields;
    update[fieldName] = null;

    this.props.updateRemote(update);
  }

  private updateRemote(value, field) {
    const numericFields = ['download_concurrency', 'rate_limit'];
    if (numericFields.includes(field)) {
      value = Number.isInteger(value)
        ? value
        : Number.isNaN(parseInt(value, 10))
        ? null
        : parseInt(value, 10);
    }

    const update = { ...this.props.remote };
    update[field] = value;
    this.props.updateRemote(update);
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
