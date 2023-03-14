import { t } from '@lingui/macro';
import { Button, Modal } from '@patternfly/react-core';
import { FolderOpenIcon, SpinnerIcon } from '@patternfly/react-icons';
import axios from 'axios';
import React, { useState } from 'react';
import {
  CollectionAPI,
  CollectionListType,
  CollectionUploadType,
} from 'src/api';
import './import-modal.scss';

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

export const ImportModal = (props: IProps) => {
  const acceptedFileTypes = ['application/x-gzip', 'application/gzip'];
  let cancelToken: ReturnType<typeof CollectionAPI.getCancelToken>;
  const COLLECTION_NAME_REGEX = /[0-9a-z_]+-[0-9a-z_]+-[0-9A-Za-z.+-]+/;

  const [file, setFile] = useState<File>(undefined);
  const [errors, setErrors] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<Status>(Status.waiting);

  const { isOpen, collection } = props;

  function canUpload() {
    if (errors) {
      return false;
    }

    if (uploadStatus !== Status.waiting) {
      return false;
    }

    if (!file) {
      return false;
    }

    return true;
  }

  function renderFileIcon() {
    switch (uploadStatus) {
      case Status.uploading:
        return <SpinnerIcon className='fa-spin'></SpinnerIcon>;
      default:
        return <FolderOpenIcon></FolderOpenIcon>;
    }
  }

  function handleFileUpload(files) {
    // Selects the artifact that will be uploaded and performs some basic
    // preliminary checks on it.
    const newCollection = files[0];
    const { collection } = props;

    if (files.length > 1) {
      setErrors(t`Please select no more than one file.`);
    } else if (!acceptedFileTypes.includes(newCollection.type)) {
      setErrors(t`Invalid file format.`);
      setFile(newCollection);
      setUploadProgress(0);
    } else if (!COLLECTION_NAME_REGEX.test(newCollection.name)) {
      setErrors(
        t`Invalid file name. Collections must be formatted as 'namespace-collection_name-1.0.0'`,
      );
      setFile(newCollection);
      setUploadProgress(0);
    } else if (
      collection &&
      collection.name !== newCollection.name.split('-')[1]
    ) {
      setErrors(
        t`The collection you have selected doesn't appear to match ${collection.name}`,
      );
      setFile(newCollection);
      setUploadProgress(0);
    } else if (props.namespace != newCollection.name.split('-')[0]) {
      setErrors(
        t`The collection you have selected does not match this namespace.`,
      );
      setFile(newCollection);
      setUploadProgress(0);
    } else {
      setErrors('');
      setFile(newCollection);
      setUploadProgress(0);
    }
  }

  function saveFile() {
    setUploadStatus(Status.uploading);
    const artifact = {
      file: file,
      sha256: '',
    } as CollectionUploadType;

    cancelToken = CollectionAPI.getCancelToken();

    CollectionAPI.upload(
      artifact,
      (e) => {
        setUploadProgress(e.loaded / e.total);
      },
      cancelToken,
    )
      .then((response) => {
        props.onUploadSuccess(response);
      })
      .catch((errors) => {
        let errorMessage = '';

        // If request was canceled by the user
        if (!axios.isCancel(errors)) {
          // Upload fails
          if (errors.response.data.errors) {
            const messages = [];
            for (const err of errors.response.data.errors) {
              messages.push(
                err.detail ||
                  err.title ||
                  err.code ||
                  t`API error. Status code: ${err.status}`,
              );
            }
            errorMessage = messages.join(', ');
          } else {
            errorMessage = t`API error. Status code: ${errors.response.status}`;
          }
        }
        setUploadStatus(Status.waiting);
        setErrors(errorMessage);
      })
      .finally(() => {
        cancelToken = null;
      });
  }

  function handleClose() {
    let msg = null;
    if (cancelToken && uploadStatus === Status.uploading) {
      msg = t`Collection upload canceled`;
      cancelToken.cancel(msg);
    }

    setFile(undefined);
    setErrors('');
    setUploadProgress(0);
    setUploadStatus(Status.waiting);
    props.setOpen(false, msg);
  }

  return (
    <Modal
      variant='small'
      title={
        collection ? t`New version of ${collection.name}` : t`New collection`
      }
      isOpen={isOpen}
      onClose={() => handleClose()}
      actions={[
        <Button
          key='confirm'
          variant='primary'
          onClick={() => saveFile()}
          isDisabled={!canUpload()}
          data-cy={'confirm-upload'}
        >
          {t`Upload`}
        </Button>,
        <Button key='cancel' variant='secondary' onClick={() => handleClose()}>
          {t`Cancel`}
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
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <label className='upload-file-label' htmlFor='collection-widget'>
            <div className='upload-box'>
              <div className='upload-button'>{renderFileIcon()}</div>
              <div className='upload-text'>
                {file != null ? file.name : t`Select file`}
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
};
