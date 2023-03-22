import { t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  DropdownItem,
  Label,
  LabelGroup,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  DownloadIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  CertificateUploadAPI,
  CollectionAPI,
  CollectionVersion,
  CollectionVersionAPI,
  Repositories,
} from 'src/api';
import { Repository } from 'src/api/response-types/repositories';
import {
  ApproveModal,
  BaseHeader,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  ListItemActions,
  Main,
} from 'src/components';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  CompoundFilter,
  LoadingPageSpinner,
  LoadingPageWithHeader,
  Pagination,
  SortTable,
  UploadSingCertificateModal,
  closeAlertMixin,
} from 'src/components';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ParamHelper,
  RouteProps,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  waitForTask,
  waitForTaskUrl,
  withRouter,
} from 'src/utilities';
import './certification-dashboard.scss';

interface IState {
  params: {
    certification?: string;
    namespace?: string;
    collection?: string;
    page?: number;
    page_size?: number;
  };
  alerts: AlertType[];
  versions: CollectionVersion[];
  itemCount: number;
  loading: boolean;
  updatingVersions: CollectionVersion[];
  unauthorized: boolean;
  inputText: string;
  uploadCertificateModalOpen: boolean;
  versionToUploadCertificate?: CollectionVersion;
  approveModalInfo: {
    collectionVersion: CollectionVersion;
  };
  repositoryList: Repository[];
}

class CertificationDashboard extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = '-pulp_created';
    }

    if (!params['repository']) {
      params['repository'] = 'staging';
    }

    this.state = {
      versions: undefined,
      itemCount: 0,
      params: params,
      loading: true,
      updatingVersions: [],
      alerts: [],
      unauthorized: false,
      inputText: '',
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: null,
      approveModalInfo: null,
      repositoryList: [],
    };
  }

  componentDidMount() {
    const { user, hasPermission } = this.context;
    if (
      !user ||
      user.is_anonymous ||
      !hasPermission('ansible.modify_ansible_repo_content')
    ) {
      this.setState({ unauthorized: true });
    } else {
      this.setState({ loading: true });

      const promises = [];

      promises.push(
        Repositories.listApproved()
          .then((data) => {
            this.setState({ repositoryList: data.data.results });
          })
          .catch(({ response: { status, statusText } }) => {
            this.addAlertObj({
              title: t`Failed to load repositories.`,
              variant: 'danger',
              description: errorMessage(status, statusText),
            });
          }),
      );

      promises.push(this.queryCollections(false));

      Promise.all(promises).then(() => {
        this.setState({ loading: false });
        this.setState({ updatingVersions: [] });
      });
    }
  }

  render() {
    const { versions, params, itemCount, loading, unauthorized } = this.state;

    if (!versions && !unauthorized) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    return (
      <React.Fragment>
        <BaseHeader title={t`Approval dashboard`}></BaseHeader>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main className='hub-certification-dashboard'>
            <section className='body' data-cy='body'>
              <div className='toolbar hub-toolbar'>
                <Toolbar>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <CompoundFilter
                        inputText={this.state.inputText}
                        onChange={(text) => {
                          this.setState({ inputText: text });
                        }}
                        updateParams={(p) =>
                          this.updateParams(p, () =>
                            this.queryCollections(true),
                          )
                        }
                        params={params}
                        filterConfig={[
                          {
                            id: 'namespace',
                            title: t`Namespace`,
                          },
                          {
                            id: 'name',
                            title: t`Collection Name`,
                          },
                          {
                            id: 'repository',
                            title: t`Status`,
                            inputType: 'select',
                            options: [
                              {
                                id: Constants.NOTCERTIFIED,
                                title: t`Rejected`,
                              },
                              {
                                id: Constants.NEEDSREVIEW,
                                title: t`Needs Review`,
                              },
                              {
                                id: Constants.PUBLISHED,
                                title: t`Approved`,
                              },
                            ],
                          },
                        ]}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </Toolbar>

                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryCollections(true))
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={(p) => {
                    this.updateParams(p, () => this.queryCollections(true));
                    this.setState({ inputText: '' });
                  }}
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort']}
                  niceValues={{
                    repository: {
                      [Constants.PUBLISHED]: t`Approved`,
                      [Constants.NEEDSREVIEW]: t`Needs Review`,
                      [Constants.NOTCERTIFIED]: t`Rejected`,
                    },
                  }}
                  niceNames={{
                    repository: t`Status`,
                  }}
                />
              </div>
              {loading ? (
                <LoadingPageSpinner />
              ) : (
                this.renderTable(versions, params)
              )}

              <div className='footer'>
                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryCollections(true))
                  }
                  count={itemCount}
                />
              </div>
            </section>
            <UploadSingCertificateModal
              isOpen={this.state.uploadCertificateModalOpen}
              onCancel={() => this.closeUploadCertificateModal()}
              onSubmit={(d) => this.submitCertificate(d)}
            />
            {this.state.approveModalInfo && (
              <ApproveModal
                closeAction={() => {
                  this.setState({ approveModalInfo: null });
                }}
                finishAction={() => {
                  this.setState({ approveModalInfo: null });
                  this.queryCollections(true);
                }}
                collectionVersion={
                  this.state.approveModalInfo.collectionVersion
                }
                addAlert={(alert) => this.addAlertObj(alert)}
                allRepositories={this.state.repositoryList}
              />
            )}
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderTable(versions, params) {
    if (versions.length === 0) {
      return filterIsSet(params, ['namespace', 'name', 'repository']) ? (
        <EmptyStateFilter />
      ) : (
        <EmptyStateNoData
          title={t`No managed collections yet`}
          description={t`Collections will appear once uploaded`}
        />
      );
    }
    const sortTableOptions = {
      headers: [
        {
          title: t`Namespace`,
          type: 'alpha',
          id: 'namespace',
        },
        {
          title: t`Collection`,
          type: 'alpha',
          id: 'collection',
        },
        {
          title: t`Version`,
          type: 'number',
          id: 'version',
        },
        {
          title: t`Date created`,
          type: 'number',
          id: 'pulp_created',
        },
        {
          title: t`Repositories`,
          type: 'none',
          id: '',
        },
        {
          title: t`Status`,
          type: 'none',
          id: 'status',
        },
        {
          title: '',
          type: 'none',
          id: 'certify',
        },
      ],
    };

    return (
      <table
        aria-label={t`Collection versions`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) =>
            this.updateParams(p, () => this.queryCollections(true))
          }
        />
        <tbody>
          {versions.map((version, i) => this.renderRow(version, i))}
        </tbody>
      </table>
    );
  }

  private renderStatus(version: CollectionVersion) {
    if (this.state.updatingVersions.includes(version)) {
      return <span className='fa fa-lg fa-spin fa-spinner' />;
    }
    if (this.isApproved(version)) {
      const { display_signatures } = this.context.featureFlags;
      return (
        <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
          {display_signatures && version.sign_state === 'signed'
            ? t`Signed and approved`
            : t`Approved`}
        </Label>
      );
    }
    if (version.repository_list.includes(Constants.NOTCERTIFIED)) {
      return (
        <Label variant='outline' color='red' icon={<ExclamationCircleIcon />}>
          {t`Rejected`}
        </Label>
      );
    }
    if (version.repository_list.includes(Constants.NEEDSREVIEW)) {
      const { can_upload_signatures, require_upload_signatures } =
        this.context.featureFlags;
      return (
        <Label
          variant='outline'
          color='orange'
          icon={<ExclamationTriangleIcon />}
        >
          {version.sign_state === 'unsigned' &&
          can_upload_signatures &&
          require_upload_signatures
            ? t`Needs signature and review`
            : t`Needs review`}
        </Label>
      );
    }
  }

  private renderRow(version: CollectionVersion, index) {
    return (
      <tr key={index} data-cy='CertificationDashboard-row'>
        <td>{version.namespace}</td>
        <td>{version.name}</td>
        <td>
          <Link
            to={formatPath(
              Paths.collectionByRepo,
              {
                namespace: version.namespace,
                collection: version.name,
                repo: version.repository_list[0],
              },
              {
                version: version.version,
              },
            )}
          >
            {version.version}
          </Link>
          <Button
            variant={ButtonVariant.link}
            onClick={() => {
              this.download(version.namespace, version.name, version.version);
            }}
          >
            <DownloadIcon />
          </Button>
        </td>
        <td>
          <DateComponent date={version.created_at} />
        </td>
        <td>
          <LabelGroup>
            {version.repository_list.map((repo, i) => {
              let text = repo;
              if (i < version.repository_list.length - 1) {
                text += ', ';
              }
              return text;
            })}
          </LabelGroup>
        </td>
        <td>{this.renderStatus(version)}</td>
        {this.renderButtons(version)}
      </tr>
    );
  }

  private renderButtons(version: CollectionVersion) {
    // not checking namespace permissions here, auto_sign happens API side, so is the permission check
    const {
      can_upload_signatures,
      collection_auto_sign,
      require_upload_signatures,
    } = this.context.featureFlags;
    if (this.state.updatingVersions.includes(version)) {
      return <ListItemActions />; // empty td;
    }

    const canUploadSignature =
      can_upload_signatures && version.sign_state === 'unsigned';
    const mustUploadSignature = canUploadSignature && require_upload_signatures;
    const autoSign = collection_auto_sign && !require_upload_signatures;

    const approveButton = [
      canUploadSignature && (
        <React.Fragment key='upload'>
          <Button onClick={() => this.openUploadCertificateModal(version)}>
            {t`Upload signature`}
          </Button>{' '}
        </React.Fragment>
      ),
      <Button
        key='approve'
        isDisabled={mustUploadSignature}
        data-cy='approve-button'
        onClick={() => {
          this.approve(version);
        }}
      >
        {autoSign ? t`Sign and approve` : t`Approve`}
      </Button>,
    ].filter(Boolean);

    const importsLink = (
      <DropdownItem
        key='imports'
        component={
          <Link
            to={formatPath(
              Paths.myImports,
              {},
              {
                namespace: version.namespace,
                name: version.name,
                version: version.version,
              },
            )}
          >
            {t`View Import Logs`}
          </Link>
        }
      />
    );

    const certifyDropDown = (isDisabled: boolean) => (
      <DropdownItem
        onClick={() => this.approve(version)}
        isDisabled={isDisabled}
        key='certify'
      >
        {autoSign ? t`Sign and approve` : t`Approve`}
      </DropdownItem>
    );

    const rejectDropDown = (isDisabled: boolean) => (
      <DropdownItem
        onClick={() => {
          this.reject(version);
        }}
        isDisabled={isDisabled}
        className='rejected-icon'
        key='reject'
      >
        {t`Reject`}
      </DropdownItem>
    );

    if (this.isApproved(version)) {
      return (
        <ListItemActions
          kebabItems={[
            certifyDropDown(true),
            rejectDropDown(false),
            importsLink,
          ]}
        />
      );
    }

    if (version.repository_list.includes(Constants.NOTCERTIFIED)) {
      // render reject button if version is in multiple repositories including rejected state - handles inconsistency
      // and allows user to reject it again to move it all to rejected state
      return (
        <ListItemActions
          kebabItems={[
            certifyDropDown(false),
            rejectDropDown(version.repository_list.length == 1),
            importsLink,
          ]}
        />
      );
    }
    if (version.repository_list.includes(Constants.NEEDSREVIEW)) {
      return (
        <ListItemActions
          kebabItems={[rejectDropDown(false), importsLink]}
          buttons={approveButton}
        />
      );
    }
  }

  private openUploadCertificateModal(version: CollectionVersion) {
    this.setState({
      uploadCertificateModalOpen: true,
      versionToUploadCertificate: version,
    });
  }

  private closeUploadCertificateModal() {
    this.setState({
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: null,
    });
  }

  private submitCertificate(file: File) {
    const version = this.state.versionToUploadCertificate;
    const signed_collection = `${PULP_API_BASE_PATH}content/ansible/collection_versions/${version.id}/`;

    return Repositories.getRepository({
      name: 'staging',
    })
      .then((response) =>
        CertificateUploadAPI.upload({
          file,
          repository: response.data.results[0].pulp_href,
          signed_collection,
        }),
      )
      .then((result) => waitForTask(parsePulpIDFromURL(result.data.task)))
      .then(() =>
        this.addAlert(
          t`Certificate for collection "${version.namespace} ${version.name} v${version.version}" has been successfully uploaded.`,
          'success',
        ),
      )
      .then(() => this.queryCollections(true))
      .catch((error) => {
        const description = !error.response
          ? error
          : errorMessage(error.response.status, error.response.statusText);

        this.addAlert(
          t`The certificate for "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
          'danger',
          description,
        );
      })
      .finally(() => this.closeUploadCertificateModal());
  }

  private isApproved(version) {
    let approvedRepoFound = true;

    if (version.repository_list.length == 0) {
      return false;
    }

    version.repository_list.forEach((repo) => {
      if (!this.state.repositoryList.find((r) => r.name == repo)) {
        approvedRepoFound = false;
      }
    });

    return approvedRepoFound;
  }

  private approve(version) {
    if (version.repository_list.length == 0) {
      // I hope that this may not occure ever, but to be sure...
      this.addAlert(
        t`Approval failed.`,
        'danger',
        t`Collection not found in any repository.`,
      );
      return;
    }

    if (this.state.repositoryList.length == 1) {
      const originalRepo = version.repository_list.find(
        (repo) =>
          repo == Constants.NEEDSREVIEW || repo == Constants.NOTCERTIFIED,
      );
      if (originalRepo) {
        this.updateCertification(
          version,
          originalRepo,
          this.state.repositoryList[0].name,
        );
      } else {
        // I hope that this may not occure ever, but to be sure...
        this.addAlert(
          t`Approval failed.`,
          'danger',
          t`Collection has to be in rejected or staging repository.`,
        );
      }
    } else {
      this.setState({ approveModalInfo: { collectionVersion: version } });
    }
  }

  private reject(version) {
    if (version.repository_list.length == 0) {
      // I hope that this may not occure ever, but to be sure...
      this.addAlert(
        t`Rejection failed.`,
        'danger',
        t`Collection not found in any repository.`,
      );
      return;
    }

    if (version.repository_list.length == 1) {
      // maintain vanilla functionality
      this.updateCertification(
        version,
        version.repository_list[0],
        Constants.NOTCERTIFIED,
      );
    } else {
      const promises = [];
      const repositoryList = this.state.repositoryList;

      this.setState({ updatingVersions: [version] });

      const removedRepos = [];
      const failedRepos = [];

      version.repository_list.forEach((repo) => {
        const repoInfo = repositoryList.find((r) => r.name == repo);

        if (repoInfo?.pulp_labels?.pipeline == 'approved') {
          const promise = CollectionVersionAPI.setRepository(
            version.namespace,
            version.name,
            version.version,
            repo,
            Constants.NOTCERTIFIED,
          )
            .then((task) => {
              return waitForTaskUrl(task['data'].copy_task_id);
            })
            .then(() => {
              removedRepos.push(repo);
            })
            .catch(() => {
              failedRepos.push(repo);
            });
          promises.push(promise);
        }
      });

      Promise.all(promises).then(() => {
        this.setState({ loading: false });
        this.queryCollections(true);
        if (failedRepos.length == 0) {
          this.addAlertObj({
            title: t`Certification status for collection "${version.namespace} ${version.name} v${version.version}" has been successfully updated.`,
            variant: 'success',
          });
        } else {
          if (removedRepos.length > 0) {
            this.addAlertObj({
              title: t`Rejection summary.`,
              variant: 'danger',
              description: t`Collection was sucessfuly rejected from those repositories: ${removedRepos.join(
                ', ',
              )}, but failed to be removed from those repositories: ${failedRepos.join(
                ', ',
              )}`,
            });
          } else {
            this.addAlertObj({
              title: t`Rejection failed.`,
              variant: 'danger',
              description: t`Collection failed to be removed from those repositories: ${failedRepos.join(
                ', ',
              )}`,
            });
          }
        }
      });
    }
  }

  private updateCertification(version, originalRepo, destinationRepo) {
    this.setState({ updatingVersions: [version] });

    return CollectionVersionAPI.setRepository(
      version.namespace,
      version.name,
      version.version,
      originalRepo,
      destinationRepo,
    )
      .then((result) =>
        waitForTask(result.data.remove_task_id, { waitMs: 500 }),
      )
      .then(() =>
        this.addAlert(
          t`Certification status for collection "${version.namespace} ${version.name} v${version.version}" has been successfully updated.`,
          'success',
        ),
      )
      .then(() => this.queryCollections(true))
      .catch((error) => {
        const description = !error.response
          ? error
          : errorMessage(error.response.status, error.response.statusText);

        this.addAlert(
          t`Changes to certification status for collection "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
          'danger',
          description,
        );
      });
  }

  private queryCollections(handleLoading) {
    if (handleLoading) {
      this.setState({
        loading: true,
      });
    }

    return CollectionVersionAPI.list(this.state.params)
      .then((result) => {
        this.setState({
          versions: result.data.data,
          itemCount: result.data.meta.count,
        });
        if (handleLoading) {
          this.setState({
            loading: false,
            updatingVersions: [],
          });
        }
      })
      .catch((error) => {
        this.addAlert(t`Error loading collections.`, 'danger', error?.message);
        this.setState({
          loading: false,
          updatingVersions: [],
        });
      });
  }

  private download(namespace: string, name: string, version: string) {
    CollectionAPI.getDownloadURL('staging', namespace, name, version).then(
      (downloadURL: string) => {
        window.location.assign(downloadURL);
      },
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
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
}

export default withRouter(CertificationDashboard);

CertificationDashboard.contextType = AppContext;
