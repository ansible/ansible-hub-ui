import * as React from 'react';
import './import-modal.scss';
import axios from 'axios';

import { Modal, Button } from '@patternfly/react-core';
import { FolderOpenIcon, SpinnerIcon } from '@patternfly/react-icons';

import {
    CollectionListType,
    CollectionAPI,
    CollectionUploadType,
} from '../../api';

enum Status {
    uploading = 'uploading',
    waiting = 'waiting',
}

interface IProps {
    isOpen: boolean;
    setOpen: (isOpen, warnings?) => void;
    onUploadSuccess: (result) => void;

    collection?: CollectionListType;
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
                isSmall
                title='Upload a new collection'
                isOpen={isOpen}
                onClose={() => this.handleClose()}
                actions={[
                    <Button
                        key='cancel'
                        variant='secondary'
                        onClick={() => this.handleClose()}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key='confirm'
                        variant='primary'
                        onClick={() => this.saveFile()}
                        isDisabled={!this.canUpload()}
                    >
                        Upload
                    </Button>,
                ]}
            >
                <div className='upload-collection'>
                    <h4>
                        Upload
                        {collection
                            ? ' a new version of ' + collection.name
                            : ''}
                    </h4>
                    <form>
                        <input
                            disabled={uploadStatus !== Status.waiting}
                            className='upload-file'
                            type='file'
                            id='collection-widget'
                            onChange={e =>
                                this.handleFileUpload(e.target.files)
                            }
                        />
                        <label
                            className='upload-file-label'
                            htmlFor='collection-widget'
                        >
                            <div className='upload-box'>
                                <div className='upload-button'>
                                    {this.renderFileIcon()}
                                </div>
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
            .catch(error => {
                console.log(error);
                let errorMessage = '';

                // If request was canceled by the user
                if (!axios.isCancel(error)) {
                    // Upload fails
                    // todo: DON'T MERGE UNTIL THIS IS SET TO USE api/v3 ERRORS
                    // for (let err of error.response.data.errors) {
                    //     errorMessage = errorMessage + ', ' + err;
                    // }
                    errorMessage = error.response.data.message;
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
