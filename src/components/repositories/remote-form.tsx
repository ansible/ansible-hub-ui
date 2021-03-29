import * as React from 'react';
import * as FileSaver from 'file-saver';

import {
  Form,
  FormGroup,
  TextInput,
  FileUpload,
  Flex,
  FlexItem,
  Button,
  Modal,
  Checkbox,
  ExpandableSection,
} from '@patternfly/react-core';

import { WriteOnlyField, HelperText } from 'src/components';

import { DownloadIcon } from '@patternfly/react-icons';

import { RemoteType, WriteOnlyFieldType } from 'src/api';
import { Constants } from 'src/constants';
import { isFieldSet } from 'src/utilities';

interface IProps {
  updateRemote: (remote) => void;
  remote: RemoteType;
  saveRemote: () => void;
  showModal: boolean;
  closeModal: () => void;
  errorMessages: object;
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
    const remoteType = this.getRemoteType(remote.url);

    let requiredFields = ['name', 'url'];
    let disabledFields = ['name'];

    if (remoteType === 'certified') {
      requiredFields = requiredFields.concat(['auth_url']);
      disabledFields = disabledFields.concat(['requirements_file']);
    }

    if (remoteType === 'community') {
      requiredFields = requiredFields.concat(['requirements_file']);
      disabledFields = disabledFields.concat(['auth_url', 'token']);
    }
    return (
      <Modal
        isOpen={this.props.showModal}
        title='Edit remote'
        variant='small'
        onClose={() => this.props.closeModal()}
        actions={[
          <Button
            isDisabled={!this.isValid(requiredFields)}
            key='confirm'
            variant='primary'
            onClick={() => this.props.saveRemote()}
          >
            Save
          </Button>,
          <Button
            key='cancel'
            variant='secondary'
            onClick={() => this.props.closeModal()}
          >
            Cancel
          </Button>,
        ]}
      >
        {this.renderForm(requiredFields, disabledFields)}
      </Modal>
    );
  }

  private renderForm(requiredFields, disabledFields) {
    const { remote, errorMessages } = this.props;
    return (
      <Form>
        <FormGroup
          fieldId={'name'}
          label={'Name'}
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
            onChange={value => this.updateRemote(value, 'name')}
          />
        </FormGroup>
        <FormGroup
          fieldId={'url'}
          label={'URL'}
          labelIcon={
            <HelperText content='The URL of an external content source.' />
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
            onChange={value => this.updateRemote(value, 'url')}
          />
        </FormGroup>
        {!disabledFields.includes('token') && (
          <FormGroup
            fieldId={'token'}
            label={'Token'}
            labelIcon={
              <HelperText content='Token for authenticating to the server URL.' />
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
                onChange={value => this.updateRemote(value, 'token')}
              />
            </WriteOnlyField>
          </FormGroup>
        )}

        {!disabledFields.includes('auth_url') && (
          <FormGroup
            fieldId={'auth_url'}
            label={'SSO URL'}
            labelIcon={<HelperText content='Single sign on URL.' />}
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
              onChange={value => this.updateRemote(value, 'auth_url')}
            />
          </FormGroup>
        )}

        {!disabledFields.includes('requirements_file') && (
          <FormGroup
            fieldId={'yaml'}
            label={'YAML requirements'}
            labelIcon={
              <HelperText
                content={
                  <>
                    This uses the same{' '}
                    <a
                      target='_blank'
                      href='https://docs.ansible.com/ansible/latest/user_guide/collections_using.html#install-multiple-collections-with-a-requirements-file'
                    >
                      requirements.yml
                    </a>{' '}
                    format as the ansible-galaxy CLI with the caveat that roles
                    aren't supported and the source parameter is not supported.
                  </>
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
                  aria-label='Download requirements file'
                >
                  <DownloadIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FormGroup>
        )}
        <ExpandableSection
          toggleTextExpanded='Hide advanced options'
          toggleTextCollapsed='Show advanced options'
        >
          <FormGroup
            fieldId={'username'}
            label={'Username'}
            labelIcon={
              <HelperText content='The username to be used for authentication when syncing. This is not required when using a token.' />
            }
            isRequired={requiredFields.includes('username')}
            validated={this.toError(!('username' in errorMessages))}
            helperTextInvalid={errorMessages['username']}
          >
            <TextInput
              validated={this.toError(!('username' in errorMessages))}
              isRequired={requiredFields.includes('username')}
              isDisabled={disabledFields.includes('username')}
              id='username'
              type='text'
              value={remote.username || ''}
              onChange={value => this.updateRemote(value, 'username')}
            />
          </FormGroup>
          <FormGroup
            fieldId={'password'}
            label={'Password'}
            labelIcon={
              <HelperText content='The password to be used for authentication when syncing. This is not required when using a token.' />
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
                onChange={value => this.updateRemote(value, 'password')}
              />
            </WriteOnlyField>
          </FormGroup>
          <FormGroup
            fieldId={'proxy_url'}
            label={'Proxy URL'}
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
              onChange={value => this.updateRemote(value, 'proxy_url')}
            />
          </FormGroup>

          <FormGroup
            fieldId={'proxy_username'}
            label={'Proxy username'}
            isRequired={requiredFields.includes('proxy_username')}
            validated={this.toError(!('proxy_username' in errorMessages))}
            helperTextInvalid={errorMessages['proxy_username']}
          >
            <TextInput
              validated={this.toError(!('proxy_username' in errorMessages))}
              isRequired={requiredFields.includes('proxy_username')}
              isDisabled={disabledFields.includes('proxy_username')}
              id='proxy_username'
              type='text'
              value={remote.proxy_username || ''}
              onChange={value => this.updateRemote(value, 'proxy_username')}
            />
          </FormGroup>

          <FormGroup
            fieldId={'proxy_password'}
            label={'Proxy password'}
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
                onChange={value => this.updateRemote(value, 'proxy_password')}
              />
            </WriteOnlyField>
          </FormGroup>

          <FormGroup
            fieldId={'tls_validation'}
            label={'TLS validation'}
            labelIcon={
              <HelperText content='If selected, TLS peer validation must be performed.' />
            }
            isRequired={requiredFields.includes('tls_validation')}
            validated={this.toError(!('tls_validation' in errorMessages))}
            helperTextInvalid={errorMessages['tls_validation']}
          >
            <Checkbox
              onChange={value => this.updateRemote(value, 'tls_validation')}
              id='tls_validation'
              isChecked={remote.tls_validation}
            />
          </FormGroup>
          <FormGroup
            fieldId={'client_key'}
            label={'Client key'}
            labelIcon={
              <HelperText content='A PEM encoded private key used for authentication.' />
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
            label={'Client certificate'}
            labelIcon={
              <HelperText content='A PEM encoded client certificate used for authentication.' />
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
                  aria-label='Download client certification file'
                >
                  <DownloadIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FormGroup>
          <FormGroup
            fieldId={'ca_cert'}
            label={'CA certificate'}
            labelIcon={
              <HelperText content='A PEM encoded client certificate used for authentication.' />
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
                  aria-label='Download CA certification file'
                >
                  <DownloadIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FormGroup>
          <FormGroup
            fieldId={'download_concurrency'}
            label={'Download concurrency'}
            labelIcon={
              <HelperText content='Total number of simultaneous connections.' />
            }
            validated={remote.download_concurrency > 0 ? 'default' : 'error'}
            helperTextInvalid={'Number must be greater than 0'}
          >
            <TextInput
              id='download_concurrency'
              type='number'
              value={remote.download_concurrency}
              validated={remote.download_concurrency > 0 ? 'default' : 'error'}
              onChange={value =>
                this.updateRemote(parseInt(value), 'download_concurrency')
              }
            />
          </FormGroup>
          <FormGroup
            fieldId={'rate_limit'}
            label={'Rate Limit'}
            labelIcon={
              <HelperText content='Limits total download rate in requests per second.' />
            }
            validated={
              Number.isInteger(remote.rate_limit) || remote.rate_limit === null
                ? 'default'
                : 'error'
            }
            helperTextInvalid={'Must be an integer.'}
          >
            <TextInput
              id='rate_limit'
              type='number'
              value={remote.rate_limit}
              onChange={value =>
                this.updateRemote(parseInt(value), 'rate_limit')
              }
            />
          </FormGroup>
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

  private isValid(requiredFields) {
    const { remote } = this.props;

    for (const field of requiredFields) {
      if (!remote[field] || remote[field] === '') {
        return false;
      }
    }
    if (remote.download_concurrency < 1) {
      return false;
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
}
