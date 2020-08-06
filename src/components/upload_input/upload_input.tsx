import * as React from 'react';
import './upload_input.scss';
import { FolderOpenIcon, SpinnerIcon } from '@patternfly/react-icons';

interface IProps {
  uploadStatus: string;
  uploadProgress: number;
  fileName?: string;
  errors?: string;
  handleFileUpload: (files) => void;
}

enum Status {
  uploading = 'uploading',
  waiting = 'waiting',
}

export class UploadInput extends React.Component<IProps, {}> {
  render() {
    const {
      uploadStatus,
      uploadProgress,
      fileName,
      errors,
      handleFileUpload,
    } = this.props;
    return (
      <div className='upload-collection'>
        <form>
          <input
            disabled={uploadStatus !== Status.waiting}
            className='upload-file'
            type='file'
            id='collection-widget'
            onChange={e => handleFileUpload(e.target.files)}
          />
          <label className='upload-file-label' htmlFor='collection-widget'>
            <div className='upload-box'>
              <div className='upload-button'>{this.renderFileIcon()}</div>
              <div className='upload-text'>
                {!!fileName ? fileName : 'Select file'}
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
    );
  }

  private renderFileIcon() {
    switch (this.props.uploadStatus) {
      case Status.uploading:
        return <SpinnerIcon className='fa-spin'></SpinnerIcon>;
      default:
        return <FolderOpenIcon></FolderOpenIcon>;
    }
  }
}
