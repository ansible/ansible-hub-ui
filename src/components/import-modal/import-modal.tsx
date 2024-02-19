import { t } from '@lingui/macro';
import {
  Button,
  Flex,
  FlexItem,
  Label,
  Modal,
  Radio,
} from '@patternfly/react-core';
import FolderOpenIcon from '@patternfly/react-icons/dist/esm/icons/folder-open-icon';
import SpinnerIcon from '@patternfly/react-icons/dist/esm/icons/spinner-icon';
import axios from 'axios';
import cx from 'classnames';
import React from 'react';
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
  LabelGroup,
  MultipleRepoSelector,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { repositoryBasePath } from 'src/utilities';
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
  errorVariant: 'default' | 'skippable' | 'skipped';
  uploadProgress: number;
  uploadStatus: Status;
  loading: boolean;
  alerts: AlertType[];
  selectedRepos: AnsibleRepositoryType[]; // 0 or 1 repos
  onlyStaging: boolean;
  hideSelector: boolean;
}

export class ImportModal extends React.Component<IProps, IState> {
  static contextType = AppContext;

  acceptedFileTypes = ['application/x-gzip', 'application/gzip'];
  cancelToken: ReturnType<typeof CollectionAPI.getCancelToken>;
  COLLECTION_NAME_REGEX = /[0-9a-z_]+-[0-9a-z_]+-[0-9A-Za-z.+-]+/;

  constructor(props) {
    super(props);

    this.state = {
      file: undefined,
      errors: '',
      errorVariant: 'default' as const,
      uploadProgress: 0,
      uploadStatus: Status.waiting,
      loading: true,
      alerts: [],
      selectedRepos: [],
      onlyStaging: true,
      hideSelector: false,
    };
  }

  componentDidMount() {
    this.loadAllRepos();
  }

  private loadAllRepos() {
    const { onlyStaging } = this.state;

    const stagingByName = onlyStaging
      ? AnsibleRepositoryAPI.list({
          name: 'staging',
          page_size: 1,
          pulp_label_select: 'pipeline=staging',
        })
          .then(({ data: { results } }) => results[0])
          .catch(() => null)
      : null;

    const byPipeline = AnsibleRepositoryAPI.list({
      pulp_label_select: onlyStaging ? 'pipeline=staging' : '!pipeline',
      page_size: 1,
    });

    return Promise.all([byPipeline, stagingByName])
      .then(
        ([
          {
            data: { count, results },
          },
          staging,
        ]) => {
          // only staging: preselect "staging", or first repo if not found
          // all repos: preselect first repo only if there are no other choices
          const selectedRepos = onlyStaging
            ? [staging || results[0]].filter(Boolean)
            : count === 1
              ? [results[0]]
              : [];

          this.setState({
            selectedRepos,
            hideSelector: selectedRepos.length && count < 2,
          });
        },
      )
      .catch((error) =>
        this.addAlert(t`Error loading repositories.`, 'danger', error?.message),
      )
      .finally(() => this.setState({ loading: false }));
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

  private addAlertObj(alert) {
    this.addAlert(alert.title, alert.variant, alert.description);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  render() {
    const { collection, namespace, isOpen } = this.props;
    const {
      errorVariant,
      errors,
      file,
      hideSelector,
      onlyStaging,
      selectedRepos,
      uploadProgress,
      uploadStatus,
    } = this.state;
    const { featureFlags } = this.context;

    const skipError = () => {
      if (errorVariant === 'skippable') {
        this.setState({ errorVariant: 'skipped' as const });
      }
    };

    return (
      <Modal
        variant={'large'}
        title={
          collection
            ? t`New version of ${namespace}.${collection.name}`
            : t`New collection`
        }
        isOpen={isOpen}
        onClose={() => this.handleClose()}
        actions={[
          <Button
            key='confirm'
            variant='primary'
            onClick={() => this.saveFile()}
            isDisabled={!this.canUpload() || !this.state.selectedRepos.length}
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
            <span className={cx('file-error-messages', errorVariant)}>
              {errors}
              {errorVariant === 'skippable' && (
                <>
                  {' '}
                  <a onClick={skipError}>{t`Upload anyway?`}</a>
                </>
              )}
            </span>
          ) : null}
        </div>

        <div style={{ lineHeight: '1em' }}>&nbsp;</div>

        {featureFlags.display_repositories ? (
          <>
            <Radio
              id='radio-staging'
              isChecked={onlyStaging}
              label={t`Staging Repos`}
              name='radio-staging'
              onChange={() =>
                this.setState({ onlyStaging: true }, () => this.loadAllRepos())
              }
            />
            <Radio
              id='radio-all'
              isChecked={!onlyStaging}
              label={t`All Repos`}
              name='radio-all'
              onChange={() =>
                this.setState({ onlyStaging: false }, () => this.loadAllRepos())
              }
            />
          </>
        ) : null}

        {!onlyStaging && (
          <>{t`Please note that these repositories are not filtered by permissions. Upload may fail without the right permissions.`}</>
        )}

        {hideSelector ? (
          <Flex>
            <FlexItem>
              <b>{t`Repository`}</b>
            </FlexItem>
            <FlexItem>
              <LabelGroup>
                <Label>{selectedRepos[0].name}</Label>
              </LabelGroup>
            </FlexItem>
          </Flex>
        ) : (
          <MultipleRepoSelector
            addAlert={(a) => this.addAlertObj(a)}
            params={{
              pulp_label_select: onlyStaging ? 'pipeline=staging' : '!pipeline',
            }}
            singleSelectionOnly
            selectedRepos={selectedRepos}
            setSelectedRepos={(selectedRepos) =>
              this.setState({
                selectedRepos,
                errors: '',
                errorVariant: 'default' as const,
              })
            }
          />
        )}
      </Modal>
    );
  }

  private canUpload() {
    if (this.state.errors && this.state.errorVariant !== 'skipped') {
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
        return <SpinnerIcon className='fa-spin' />;
      default:
        return <FolderOpenIcon />;
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
        errorVariant: 'default' as const,
      });
    } else if (!this.acceptedFileTypes.includes(newCollection.type)) {
      const detectedType = newCollection.type || t`unknown`;
      const acceptedTypes: string = this.acceptedFileTypes.join(', ');
      this.setState({
        errors: t`Invalid file format: ${detectedType} (expected: ${acceptedTypes}).`,
        errorVariant: 'skippable' as const,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (!this.COLLECTION_NAME_REGEX.test(newCollection.name)) {
      this.setState({
        errors: t`Invalid file name. Collections must be formatted as 'namespace-collection_name-1.0.0'`,
        errorVariant: 'default' as const,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (
      collection &&
      collection.name !== newCollection.name.split('-')[1]
    ) {
      this.setState({
        errors: t`The collection you have selected doesn't appear to match ${collection.name}`,
        errorVariant: 'default' as const,
        file: newCollection,
        uploadProgress: 0,
      });
    } else if (this.props.namespace != newCollection.name.split('-')[0]) {
      this.setState({
        errors: t`The collection you have selected does not match this namespace.`,
        errorVariant: 'default' as const,
        file: newCollection,
        uploadProgress: 0,
      });
    } else {
      this.setState({
        errors: '',
        errorVariant: 'default' as const,
        file: newCollection,
        uploadProgress: 0,
      });
    }
  }

  async saveFile() {
    const [repo] = this.state.selectedRepos;

    this.setState({ uploadStatus: Status.uploading });

    const distro_base_path = await repositoryBasePath(
      repo.name,
      repo.pulp_href,
    ).catch((error) => {
      this.addAlert(error, 'danger');
    });

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
          errorVariant: 'default' as const,
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
        errorVariant: 'default' as const,
        uploadProgress: 0,
        uploadStatus: Status.waiting,
      },
      () => this.props.setOpen(false, msg),
    );
  }
}
