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
  AnsibleDistributionAPI,
  AnsibleRepositoryAPI,
  CertificateUploadAPI,
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
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
  RepositoriesUtils,
  RouteProps,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  waitForTask,
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
    status?: string;
    sort?: string;
  };
  alerts: AlertType[];
  versions: CollectionVersionSearch[];
  itemCount: number;
  loading: boolean;
  updatingVersions: CollectionVersionSearch[];
  unauthorized: boolean;
  inputText: string;
  uploadCertificateModalOpen: boolean;
  versionToUploadCertificate?: CollectionVersionSearch;
  approveModalInfo: {
    collectionVersion;
  };
  approvedRepositoryList: Repository[];
  stagingRepoNames: string[];
  rejectedRepoName: string;
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

    if (!params['status']) {
      params['status'] = Constants.NEEDSREVIEW;
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
      approvedRepositoryList: [],
      rejectedRepoName: null,
      stagingRepoNames: [],
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

      promises.push(this.loadRepo('staging'));
      promises.push(this.loadRepo('rejected'));

      promises.push(
        RepositoriesUtils.listApproved()
          .then((data) => {
            this.setState({ approvedRepositoryList: data });
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

  private loadRepo(pipeline) {
    return Repositories.list({ pulp_label_select: `pipeline=${pipeline}` })
      .then((data) => {
        if (data.data.results.length > 0) {
          if (pipeline == 'staging') {
            this.setState({
              stagingRepoNames: data.data.results.map((res) => res.name),
            });
          }

          if (pipeline == 'rejected') {
            this.setState({ rejectedRepoName: data.data.results[0].name });
          }
        }
      })
      .catch((error) => {
        this.addAlert(
          t`Error loading repository with label ${pipeline}.`,
          'danger',
          error?.message,
        );
      });
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
                            id: 'status',
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
                                id: Constants.APPROVED,
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
                    status: {
                      [Constants.APPROVED]: t`Approved`,
                      [Constants.NEEDSREVIEW]: t`Needs Review`,
                      [Constants.NOTCERTIFIED]: t`Rejected`,
                    },
                  }}
                  niceNames={{
                    status: t`Status`,
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
                allRepositories={this.state.approvedRepositoryList}
                stagingRepoNames={this.state.stagingRepoNames}
                rejectedRepoName={this.state.rejectedRepoName}
              />
            )}
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderTable(versions, params) {
    if (versions.length === 0) {
      return filterIsSet(params, ['namespace', 'name', 'status']) ? (
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
          id: 'name',
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
          title: t`Repository`,
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

  private isVersionUpdating(collection: CollectionVersionSearch) {
    return this.state.updatingVersions.find((v) => {
      return v == collection;
    });
  }

  private renderStatus(collectionData: CollectionVersionSearch) {
    const { repository } = collectionData;
    const repoStatus = repository.pulp_labels?.pipeline;

    if (this.isVersionUpdating(collectionData)) {
      return <span className='fa fa-lg fa-spin fa-spinner' />;
    }

    if (this.isApproved(collectionData)) {
      const { display_signatures } = this.context.featureFlags;
      return (
        <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
          {display_signatures && collectionData.is_signed
            ? t`Signed and approved`
            : t`Approved`}
        </Label>
      );
    }
    if (repoStatus === Constants.NOTCERTIFIED) {
      return (
        <Label variant='outline' color='red' icon={<ExclamationCircleIcon />}>
          {t`Rejected`}
        </Label>
      );
    }
    if (repoStatus === Constants.NEEDSREVIEW) {
      const { can_upload_signatures, require_upload_signatures } =
        this.context.featureFlags;
      return (
        <Label
          variant='outline'
          color='orange'
          icon={<ExclamationTriangleIcon />}
        >
          {!collectionData.is_signed &&
          can_upload_signatures &&
          require_upload_signatures
            ? t`Needs signature and review`
            : t`Needs review`}
        </Label>
      );
    }
  }

  private renderRow(collectionData: CollectionVersionSearch, index) {
    const { collection_version: version, repository } = collectionData;
    const data_cy = `CertificationDashboard-row-${collectionData.repository.name}-${collectionData.collection_version.namespace}-${collectionData.collection_version.name}`;
    return (
      <tr key={index} data-cy={data_cy}>
        <td>{version.namespace}</td>
        <td>{version.name}</td>
        <td>
          <Link
            to={formatPath(
              Paths.collectionByRepo,
              {
                namespace: version.namespace,
                collection: version.name,
                repo: repository.name,
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
              this.download(
                repository,
                version.namespace,
                version.name,
                version.version,
              );
            }}
          >
            <DownloadIcon />
          </Button>
        </td>
        <td>
          <DateComponent date={version.pulp_created} />
        </td>
        <td>
          <LabelGroup>{repository.name}</LabelGroup>
        </td>
        <td>{this.renderStatus(collectionData)}</td>
        {this.renderButtons(collectionData)}
      </tr>
    );
  }

  private renderButtons(collectionData: CollectionVersionSearch) {
    // not checking namespace permissions here, auto_sign happens API side, so is the permission check
    const { collection_version: version, repository } = collectionData;
    const {
      can_upload_signatures,
      collection_auto_sign,
      require_upload_signatures,
    } = this.context.featureFlags;
    if (this.isVersionUpdating(collectionData)) {
      return <ListItemActions />; // empty td;
    }

    const canUploadSignature =
      can_upload_signatures && !collectionData.is_signed;
    const mustUploadSignature = canUploadSignature && require_upload_signatures;
    const autoSign = collection_auto_sign && !require_upload_signatures;

    const approveButton = [
      canUploadSignature && (
        <React.Fragment key='upload'>
          <Button
            onClick={() => this.openUploadCertificateModal(collectionData)}
          >
            {t`Upload signature`}
          </Button>{' '}
        </React.Fragment>
      ),
      <Button
        key='approve'
        isDisabled={mustUploadSignature}
        data-cy='approve-button'
        onClick={() => {
          this.approve(collectionData);
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
        onClick={() => this.approve(collectionData)}
        isDisabled={isDisabled}
        key='certify'
      >
        {autoSign ? t`Sign and approve` : t`Approve`}
      </DropdownItem>
    );

    const rejectDropDown = (isDisabled: boolean) => (
      <DropdownItem
        onClick={() => {
          this.reject(collectionData);
        }}
        isDisabled={isDisabled}
        className='rejected-icon'
        key='reject'
      >
        {t`Reject`}
      </DropdownItem>
    );

    const repoStatus = repository.pulp_labels?.pipeline;

    if (this.isApproved(collectionData)) {
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

    if (repoStatus === Constants.NOTCERTIFIED) {
      // render reject button if version is in multiple repositories including rejected state - handles inconsistency
      // and allows user to reject it again to move it all to rejected state
      return (
        <ListItemActions
          kebabItems={[
            certifyDropDown(false),
            rejectDropDown(true),
            importsLink,
          ]}
        />
      );
    }

    if (repoStatus === Constants.NEEDSREVIEW) {
      return (
        <ListItemActions
          kebabItems={[rejectDropDown(false), importsLink]}
          buttons={approveButton}
        />
      );
    }
  }

  private openUploadCertificateModal(version: CollectionVersionSearch) {
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
    const { collection_version, repository } =
      this.state.versionToUploadCertificate;
    const signed_collection = collection_version.pulp_href;
    const { name, namespace, version } = collection_version;
    CertificateUploadAPI.upload({
      file,
      repository: repository.pulp_href,
      signed_collection,
    })
      .then((result) => waitForTask(parsePulpIDFromURL(result.data.task)))
      .then(() =>
        this.addAlert(
          t`Certificate for collection "${namespace} ${name} v${version}" has been successfully uploaded.`,
          'success',
        ),
      )
      .then(() => this.queryCollections(true))
      .catch((error) => {
        const description = !error.response
          ? error
          : errorMessage(error.response.status, error.response.statusText);

        this.addAlert(
          t`The certificate for "${namespace} ${name} v${version}" could not be saved.`,
          'danger',
          description,
        );
      })
      .finally(() => this.closeUploadCertificateModal());
  }

  private isApproved(collection: CollectionVersionSearch) {
    if (!collection) {
      return false;
    }

    return this.state.approvedRepositoryList.find(
      (r) => r.name == collection.repository.name,
    );
  }

  private approve(collection) {
    if (!collection) {
      // I hope that this may not occure ever, but to be sure...
      this.addAlert(
        t`Approval failed.`,
        'danger',
        t`Collection not found in any repository.`,
      );
      return;
    }

    const { approvedRepositoryList } = this.state;

    if (approvedRepositoryList.length == 1) {
      if (collection.repository) {
        this.updateCertification(
          collection.collection_version,
          collection.repository.name,
          this.state.approvedRepositoryList[0].name,
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
      this.transformToCollectionVersion(collection).then(
        (collectionVersion) => {
          this.setState({ approveModalInfo: { collectionVersion } });
        },
      );
    }
  }

  private reject(collection) {
    const originalRepo = collection.repository.name;
    const version = collection.collection_version;

    this.transformToCollectionVersion(collection)
      .then((versionWithRepos) => {
        this.setState({ updatingVersions: [collection] });
        if (
          versionWithRepos.repository_list.includes(this.state.rejectedRepoName)
        ) {
          // collection already in rejected repository, so remove it from aproved repo

          RepositoriesUtils.deleteCollection(originalRepo, version.pulp_href)
            .then(() => {
              this.addAlert(
                t`Certification status for collection "${version.namespace} ${version.name} v${version.version}" has been successfully updated.`,
                'success',
              );
              this.queryCollections(true);
            })
            .catch((error) => {
              this.setState({ updatingVersions: [] });
              const description = !error.response
                ? error
                : errorMessage(
                    error.response.status,
                    error.response.statusText,
                  );

              this.addAlert(
                t`Changes to certification status for collection "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
                'danger',
                description,
              );
            });
        } else {
          // collection is not in rejected state, move it there
          this.updateCertification(
            version,
            originalRepo,
            this.state.rejectedRepoName,
          );
        }
      })
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

  private async distributionByRepoName(name) {
    const repository = (await AnsibleRepositoryAPI.list({ name }))?.data
      ?.results?.[0];
    if (!repository) {
      return Promise.reject(t`Failed to find repository ${name}`);
    }

    const distribution = (
      await AnsibleDistributionAPI.list({ repository: repository.pulp_href })
    )?.data?.results?.[0];
    if (!distribution) {
      return Promise.reject(
        t`Failed to find a distribution for repository ${name}`,
      );
    }

    return distribution;
  }

  private updateCertification(version, originalRepo, destinationRepo) {
    // galaxy_ng CollectionRepositoryMixing.get_repos uses the distribution base path to look up repository pk
    // there ..may be room for simplification since we already know the repo; OTOH also compatibility concerns
    return Promise.all([
      this.distributionByRepoName(originalRepo),
      this.distributionByRepoName(destinationRepo),
    ])
      .then(([source, destination]) =>
        CollectionVersionAPI.move(
          version.namespace,
          version.name,
          version.version,
          source.base_path,
          destination.base_path,
        ),
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

    const { status, sort, ...params } = this.state.params;

    const updatedParams = {
      order_by: sort,
      ...params,
    };

    if (status) {
      updatedParams['repository_label'] = `pipeline=${status}`;
    }

    return CollectionVersionAPI.list(updatedParams)
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

  private download(
    repository: CollectionVersionSearch['repository'],
    namespace: string,
    name: string,
    version: string,
  ) {
    CollectionAPI.getDownloadURL(repository, namespace, name, version).then(
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

  async getCollectionRepoList(collection: CollectionVersionSearch) {
    const { name, namespace, version } = collection.collection_version;

    // get repository list for selected collection
    const collectionInRepos = await CollectionVersionAPI.list({
      namespace,
      name,
      version,
      page_size: 100000,
      offset: 0,
    });

    const collectionRepos = collectionInRepos.data.data.map(
      ({ repository }) => repository.name,
    );

    return collectionRepos;
  }

  // compose from collectionVersionSearch to CollectionVersion structure for approval modal
  async transformToCollectionVersion(collection: CollectionVersionSearch) {
    const repoList = await this.getCollectionRepoList(collection);

    const { collection_version } = collection;
    const id = parsePulpIDFromURL(collection_version.pulp_href);
    const collectionVersion = {
      id,
      version: collection_version.version,
      namespace: collection_version.namespace,
      name: collection_version.name,
      repository_list: repoList,
    };

    return collectionVersion;
  }
}

export default withRouter(CertificationDashboard);

CertificationDashboard.contextType = AppContext;
