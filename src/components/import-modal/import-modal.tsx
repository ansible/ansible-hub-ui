import { t } from '@lingui/macro';
import { Button, Modal, Radio } from '@patternfly/react-core';
import { FolderOpenIcon, SpinnerIcon } from '@patternfly/react-icons';
import axios from 'axios';
import * as React from 'react';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  CollectionAPI,
  CollectionUploadType,
  CollectionVersionSearch,
} from 'src/api';
import {
  AlertList,
  AlertType,
  MultipleRepoSelector,
  closeAlertMixin,
} from 'src/components';
import { errorMessage, repositoryBasePath } from 'src/utilities';
import './import-modal.scss';

enum Status {
  uploading = 'uploading',
  waiting = 'waiting',
}

interface IProps {
  isOpen: boolean;
  setOpen: (isOpen, warnings?) => void;
  onUploadSuccess: (result) => void;

  collection?: CollectionVersionSearch['collection_version'];
  namespace: string;
}

interface IState {
  file?: File;
  errors?: string;
  uploadProgress: number;
  uploadStatus: Status;
  allRepos: AnsibleRepositoryType[];
  loading: boolean;
  alerts: AlertType[];
  selectedRepos: string[];
  onlyStaging: boolean;
  fixedRepos: string[];
}

export class ImportModal extends React.Component<IProps, IState> {
  acceptedFileTypes = ['application/x-gzip', 'application/gzip'];
  cancelToken: ReturnType<typeof CollectionAPI.getCancelToken>;
  COLLECTION_NAME_REGEX = /[0-9a-z_]+-[0-9a-z_]+-[0-9A-Za-z.+-]+/;

  constructor(props) {
    super(props);

    this.state = {
      file: undefined,
      errors: '',
      uploadProgress: 0,
      uploadStatus: Status.waiting,
      allRepos: [],
      loading: true,
      alerts: [],
      selectedRepos: [],
      onlyStaging: true,
      fixedRepos: [],
    };
  }

  componentDidMount() {
    this.loadAllRepos('staging');
  }

  private loadAllRepos(pipeline) {
    let filter = {};
    if (this.state.onlyStaging) {
      filter = { pulp_label_select: `pipeline=${pipeline}` };
    }

    return AnsibleRepositoryAPI.list(filter)
      .then((data) => {
        this.setState({
          allRepos: data.data.results,
        });
        this.setState({ loading: false });
        if (data.data.results.length == 1) {
          this.setState({ selectedRepos: [data.data.results[0].name] });
        }

        // fill repos that user cant select
        let res = [];

        if (!this.state.onlyStaging) {
          res = data.data.results
            .filter(
              (repo) =>
                repo.pulp_labels?.pipeline &&
                repo.pulp_labels?.pipeline != 'staging',
            )
            .map((repo) => repo.name);
        }

        this.setState({ fixedRepos: res });
      })
      .catch((error) => {
        this.addAlert(
          t`Error loading repositories with label ${pipeline}.`,
          'danger',
          error?.message,
        );
        this.setState({ loading: false });
      });
  }

  private addAlert(title, variant, description?) {
    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          description,
          title,
          variant,
        },
      ],
    });
  }

  private loadRepos(params, setRepositoryList, setLoading, setItemsCount) {
    // modify params
    const par = { ...params };
    if (this.state.onlyStaging) {
      par['pulp_label_select'] = 'pipeline=staging';
    }

    setLoading(true);
    AnsibleRepositoryAPI.list(par)
      .then((data) => {
        setLoading(false);
        setRepositoryList(data.data.results);
        setItemsCount(data.data.count);
      })
      .catch(({ response: { status, statusText } }) => {
        setLoading(false);
        this.addAlertObj({
          title: t`Failed to load repositories.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  }

  private addAlertObj(alert) {
    this.addAlert(alert.title, alert.variant, alert.description);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  render() {
    const { isOpen, collection } = this.props;

    const { file, errors, uploadProgress, uploadStatus } = this.state;

    return (
      <Modal
        variant={'large'}
        title={
          collection ? t`New version of ${collection.name}` : t`New collection`
        }
        isOpen={isOpen}
        onClose={() => this.handleClose()}
        actions={[
          <Button
            key='confirm'
            variant='primary'
            onClick={() => this.saveFile()}
            isDisabled={
              !this.canUpload() || this.state.selectedRepos.length == 0
            }
            data-cy={'confirm-upload'}
          >
            {t`Upload`}
          </Button>,
          <Button
            key='cancel'
            variant='secondary'
            onClick={() => this.handleClose()}
          >
            {t`Cancel`}
          </Button>,
        ]}
      >
        <div className='upload-collection'>
          <AlertList
            alerts={this.state.alerts}
            closeAlert={(i) => this.closeAlert(i)}
          />
          <form>
            <input
              disabled={uploadStatus !== Status.waiting}
              className='upload-file'
              type='file'
              id='collection-widget'
              onChange={(e) => this.handleFileUpload(e.target.files)}
            />
            <label className='upload-file-label' htmlFor='collection-widget'>
              <div className='upload-box'>
                <div className='upload-button'>{this.renderFileIcon()}</div>
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

        <>
          <br />
          <Radio
            isChecked={this.state.onlyStaging}
            name='radio-1'
            onChange={(val) => {
              this.setState({ onlyStaging: val }, () =>
                this.loadAllRepos('staging'),
              );
            }}
            label={t`Staging Repos`}
            id='radio-staging'
          ></Radio>
          <Radio
            isChecked={!this.state.onlyStaging}
            name='radio-2'
            onChange={(val) => {
              this.setState({ onlyStaging: !val }, () =>
                this.loadAllRepos('staging'),
              );
            }}
            label={t`All Repos`}
            id='radio-all'
          ></Radio>
          {!this.state.onlyStaging && (
            <>{t`Please note that those repositories are not filtered by permission, if operation fail, you don't have it.`}</>
          )}

          <MultipleRepoSelector
            singleSelectionOnly={true}
            allRepositories={this.state.allRepos}
            fixedRepos={this.state.fixedRepos}
            selectedRepos={this.state.selectedRepos}
            setSelectedRepos={(repos) =>
              this.setState({ selectedRepos: repos, errors: '' })
            }
            hideFixedRepos={true}
            loadRepos={(params, setRepositoryList, setLoading, setItemsCount) =>
              this.loadRepos(
                params,
                setRepositoryList,
                setLoading,
                setItemsCount,
              )
            }
          />
        </>
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
        errors: t`Please select no more than one file.`,
      });
    } else if (!this.acceptedFileTypes.includes(newCollection.type)) {
      this.setState({
        errors: t`Invalid file format.`,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (!this.COLLECTION_NAME_REGEX.test(newCollection.name)) {
      this.setState({
        errors: t`Invalid file name. Collections must be formatted as 'namespace-collection_name-1.0.0'`,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (
      collection &&
      collection.name !== newCollection.name.split('-')[1]
    ) {
      this.setState({
        errors: t`The collection you have selected doesn't appear to match ${collection.name}`,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (this.props.namespace != newCollection.name.split('-')[0]) {
      this.setState({
        errors: t`The collection you have selected does not match this namespace.`,
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

  async saveFile() {
    const selectedRepos = this.state.selectedRepos;

    this.setState({ uploadStatus: Status.uploading });

    const distro_base_path = await repositoryBasePath(selectedRepos[0]).catch(
      (error) => {
        this.addAlert(error, 'danger');
      },
    );

    if (!distro_base_path) {
      this.setState({ uploadStatus: Status.waiting });
      return;
    }

    const artifact = {
      file: this.state.file,
      sha256: '',
      distro_base_path,
    } as CollectionUploadType;

    this.cancelToken = CollectionAPI.getCancelToken();

    CollectionAPI.upload(
      artifact,
      (e) => {
        this.setState({
          uploadProgress: e.loaded / e.total,
        });
      },
      this.cancelToken,
    )
      .then((response) => {
        this.props.onUploadSuccess(response);
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

        this.setState({
          uploadStatus: Status.waiting,
          errors: errorMessage,
        });
      })
      .finally(() => {
        this.cancelToken = null;
      });
  }

  handleClose() {
    let msg = null;
    if (this.cancelToken && this.state.uploadStatus === Status.uploading) {
      msg = t`Collection upload canceled`;
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
