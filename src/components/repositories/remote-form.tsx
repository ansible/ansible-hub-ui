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
