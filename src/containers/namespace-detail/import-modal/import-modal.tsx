import * as React from 'react';
import './import-modal.scss';
import axios from 'axios';

import { Modal, Button } from '@patternfly/react-core';
import { FolderOpenIcon, SpinnerIcon } from '@patternfly/react-icons';

import {
  CollectionListType,
  CollectionAPI,
  CollectionUploadType,
} from '../../../api';

enum Status {
  uploading = 'uploading',
  waiting = 'waiting',
}

interface IProps {
  isOpen: boolean;
  setOpen: (isOpen, warnings?) => void;
  onUploadSuccess: (result) => void;

  collection?: CollectionListType;
  namespace: string;
}

interface IState {
  file?: File;
  errors?: string;
  uploadProgress: number;
  uploadStatus: Status;
}

export class ImportModal extends React.Component<IProps, IState> {
  acceptedFileTypes = ['application/x-gzip', 'application/gzip'];
  cancelToken: any;
  COLLECTION_NAME_REGEX = /[0-9a-z_]+\-[0-9a-z_]+\-[0-9A-Za-z.+-]+/;

  constructor(props) {
    super(props);

    this.state = {
      file: undefined,
      errors: '',
      uploadProgress: 0,
      uploadStatus: Status.waiting,
    };
  }
  render() {
    const { isOpen, collection } = this.props;

    const { file, errors, uploadProgress, uploadStatus } = this.state;
    return (
      <Modal
        variant='small'
        title={
          collection ? 'New version of ' + collection.name : 'New collection'
        }
        isOpen={isOpen}
        onClose={() => this.handleClose()}
        actions={[
          <Button
            key='confirm'
            variant='primary'
            onClick={() => this.saveFile()}
            isDisabled={!this.canUpload()}
          >
            Upload
          </Button>,
          <Button
            key='cancel'
            variant='secondary'
            onClick={() => this.handleClose()}
          >
            Cancel
          </Button>,
        ]}
      >
        <div className='upload-collection'>
          <form>
            <input
              disabled={uploadStatus !== Status.waiting}
              className='upload-file'
              type='file'
              id='collection-widget'
              onChange={e => this.handleFileUpload(e.target.files)}
            />
            <label className='upload-file-label' htmlFor='collection-widget'>
              <div className='upload-box'>
                <div className='upload-button'>{this.renderFileIcon()}</div>
                <div className='upload-text'>
                  {file != null ? file.name : 'Select file'}
                  <div
                    className='loading-bar'
                    style={{
                      width: uploadProgress * 100 + '%',
                    }}
                  />
                </div>
              </div>
            </label>
          </form>
          {errors ? (
            <span className='file-error-messages'>
              <i className='pficon-error-circle-o' /> {errors}
            </span>
          ) : null}
        </div>
      </Modal>
    );
  }

  private canUpload() {
    if (this.state.errors) {
      return false;
    }

    if (this.state.uploadStatus !== Status.waiting) {
      return false;
    }

    if (!this.state.file) {
      return false;
    }

    return true;
  }

  private renderFileIcon() {
    switch (this.state.uploadStatus) {
      case Status.uploading:
        return <SpinnerIcon className='fa-spin'></SpinnerIcon>;
      default:
        return <FolderOpenIcon></FolderOpenIcon>;
    }
  }

  private handleFileUpload(files) {
    // Selects the artifact that will be uploaded and performs some basic
    // preliminary checks on it.
    const newCollection = files[0];
    const { collection } = this.props;

    if (files.length > 1) {
      this.setState({
        errors: 'Please select no more than one file.',
      });
    } else if (!this.acceptedFileTypes.includes(newCollection.type)) {
      this.setState({
        errors: 'Invalid file format.',
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (!this.COLLECTION_NAME_REGEX.test(newCollection.name)) {
      this.setState({
        errors: `Invalid file name. Collections must be formatted as 'namespace-collection_name-1.0.0'`,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (
      collection &&
      collection.name !== newCollection.name.split('-')[1]
    ) {
      this.setState({
        errors: `The collection you have selected doesn't appear to match ${collection.name}`,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (this.props.namespace != newCollection.name.split('-')[0]) {
      this.setState({
        errors: `The collection you have selected does not match this namespace.`,
        file: newCollection,
        uploadProgress: 0,
      });
    } else {
      this.setState({
        errors: '',
        file: newCollection,
        uploadProgress: 0,
      });
    }
  }

  saveFile() {
    this.setState({ uploadStatus: Status.uploading });
    const artifact = {
      file: this.state.file,
      sha256: '',
    } as CollectionUploadType;

    this.cancelToken = CollectionAPI.getCancelToken();

    CollectionAPI.upload(
      'inbound-' + this.props.namespace,
      artifact,
      e => {
        this.setState({
          uploadProgress: e.loaded / e.total,
        });
      },
      this.cancelToken,
    )
      .then(response => {
        this.props.onUploadSuccess(response);
      })
      .catch(errors => {
        let errorMessage = '';

        // If request was canceled by the user
        if (!axios.isCancel(errors)) {
          // Upload fails
          if (errors.response.data.errors) {
            const messages = [];
            for (let err of errors.response.data.errors) {
              messages.push(
                err.detail ||
                  err.title ||
                  err.code ||
                  'API error. Status code: ' + err.status,
              );
            }
            errorMessage = messages.join(', ');
          } else {
            errorMessage = 'API error. Status code: ' + errors.response.status;
          }
        }

        this.setState({
          uploadStatus: Status.waiting,
          errors: errorMessage,
        });
      })
      .finally(_ => {
        this.cancelToken = null;
      });
  }

  handleClose() {
    let msg = null;
    if (this.cancelToken && this.state.uploadStatus === Status.uploading) {
      msg = 'Collection upload canceled';
      this.cancelToken.cancel(msg);
    }

    this.setState(
      {
        file: undefined,
        errors: '',
        uploadProgress: 0,
        uploadStatus: Status.waiting,
      },
      () => this.props.setOpen(false, msg),
    );
  }
}
