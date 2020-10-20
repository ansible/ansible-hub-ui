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
} from '@patternfly/react-core';

import { DownloadIcon } from '@patternfly/react-icons';

import { RemoteType } from '../../api';
import { Constants } from '../../constants';

interface IProps {
  updateRemote: (remote) => void;
  remote: RemoteType;
  saveRemote: () => void;
  showModal: boolean;
  closeModal: () => void;
  errorMessages: object;
}

interface IState {
  uploadedFileName: string;
}

export class RemoteForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    let requirementsFilename = '';

    if (props.remote) {
      requirementsFilename = props.remote.requirements_file
        ? 'requirements.yml'
        : '';
    }

    this.state = {
      uploadedFileName: requirementsFilename,
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
            onChange={(value, event) => this.updateRemote(value, 'name')}
          />
        </FormGroup>
        <FormGroup
          fieldId={'url'}
          label={'URL'}
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
            onChange={(value, event) => this.updateRemote(value, 'url')}
          />
        </FormGroup>
        {!disabledFields.includes('token') && (
          <FormGroup
            fieldId={'token'}
            label={'Token'}
            isRequired={requiredFields.includes('token')}
            validated={this.toError(!('token' in errorMessages))}
            helperTextInvalid={errorMessages['token']}
          >
            <TextInput
              validated={this.toError(!('token' in errorMessages))}
              isRequired={requiredFields.includes('token')}
              placeholder='••••••••••••••••••••••'
              type='password'
              id='token'
              value={remote.token || ''}
              onChange={(value, event) => this.updateRemote(value, 'token')}
            />
          </FormGroup>
        )}

        {!disabledFields.includes('auth_url') && (
          <FormGroup
            fieldId={'auth_url'}
            label={'SSO URL'}
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
              onChange={(value, event) => this.updateRemote(value, 'auth_url')}
            />
          </FormGroup>
        )}

        {!disabledFields.includes('requirements_file') && (
          <FormGroup
            fieldId={'yaml'}
            label={'YAML requirements'}
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
                  filename={this.state.uploadedFileName}
                  value={this.props.remote.requirements_file || ''}
                  hideDefaultPreview
                  onChange={(value, filename, event) => {
                    this.setState({ uploadedFileName: filename }, () =>
                      this.updateRemote(value, 'requirements_file'),
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
                      this.state.uploadedFileName,
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
        <FormGroup
          fieldId={'username'}
          label={'Username'}
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
            value={'remote.username' || ''}
            onChange={(value, event) => console.log('TODO username')}
          />
        </FormGroup>
        <FormGroup
          fieldId={'password'}
          label={'Password'}
          isRequired={requiredFields.includes('password')}
          validated={this.toError(!('password' in errorMessages))}
          helperTextInvalid={errorMessages['password']}
        >
          <TextInput
            validated={this.toError(!('password' in errorMessages))}
            isRequired={requiredFields.includes('password')}
            isDisabled={disabledFields.includes('password')}
            id='password'
            type='text'
            value={'remote.password' || ''}
            onChange={(value, event) => console.log('TODO password')}
          />
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
            value={'remote.proxy_url' || ''}
            onChange={(value, event) => console.log('TODO proxy_url')}
          />
        </FormGroup>
        <FormGroup
          fieldId={'tls_validation'}
          label={'TLS validation'}
          isRequired={requiredFields.includes('tls_validation')}
          validated={this.toError(!('tls_validation' in errorMessages))}
          helperTextInvalid={errorMessages['tls_validation']}
        >
          <TextInput
            validated={this.toError(!('tls_validation' in errorMessages))}
            isRequired={requiredFields.includes('tls_validation')}
            isDisabled={disabledFields.includes('tls_validation')}
            id='tls_validation'
            type='text'
            value={'remote.tls_validation' || ''}
            onChange={(value, event) => console.log('TODO tls_validation')}
          />
        </FormGroup>
        <FormGroup
          fieldId={'client_key'}
          label={'Client key'}
          isRequired={requiredFields.includes('client_key')}
          validated={this.toError(!('client_key' in errorMessages))}
          helperTextInvalid={errorMessages['client_key']}
        >
          <TextInput
            validated={this.toError(!('client_key' in errorMessages))}
            isRequired={requiredFields.includes('client_key')}
            isDisabled={disabledFields.includes('client_key')}
            id='client_key'
            type='text'
            value={'remote.client_key' || ''}
            onChange={(value, event) => console.log('TODO client_key')}
          />
        </FormGroup>
        <FormGroup
          fieldId={'client_cert'}
          label={'Client certification'}
          isRequired={requiredFields.includes('client_cert')}
          validated={this.toError(!('client_cert' in errorMessages))}
          helperTextInvalid={errorMessages['client_cert']}
        >
          <TextInput
            validated={this.toError(!('client_cert' in errorMessages))}
            isRequired={requiredFields.includes('client_cert')}
            isDisabled={disabledFields.includes('client_cert')}
            id='client_cert'
            type='text'
            value={'remote.client_cert' || ''}
            onChange={(value, event) => console.log('TODO client_cert')}
          />
        </FormGroup>
        <FormGroup
          fieldId={'ca_cert'}
          label={'CA certification'}
          isRequired={requiredFields.includes('ca_cert')}
          validated={this.toError(!('ca_cert' in errorMessages))}
          helperTextInvalid={errorMessages['ca_cert']}
        >
          <TextInput
            validated={this.toError(!('ca_cert' in errorMessages))}
            isRequired={requiredFields.includes('ca_cert')}
            isDisabled={disabledFields.includes('ca_cert')}
            id='ca_cert'
            type='text'
            value={'remote.ca_cert' || ''}
            onChange={(value, event) => console.log('TODO ca_cert')}
          />
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
