import { t } from '@lingui/macro';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { Component } from 'react';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  CertificateUploadAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
} from 'src/api';
import {
  ApprovalRow,
  ApproveModal,
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
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
import { AppContext } from 'src/loaders/app-context';
import {
  ParamHelper,
  RouteProps,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  repositoryBasePath,
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
    repository_label?: string;
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
  approveModalInfo?: CollectionVersionSearch;
  repositories: {
    approved?: AnsibleRepositoryType;
    rejected?: AnsibleRepositoryType;
  };
}

class CertificationDashboard extends Component<RouteProps, IState> {
  static contextType = AppContext;

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

    if (!params['repository_label']) {
      params['repository_label'] = 'pipeline=staging';
    }

    this.state = {
      versions: undefined,
      itemCount: 0,
      params,
      loading: true,
      updatingVersions: [],
      alerts: [],
      unauthorized: false,
      inputText: '',
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: null,
      approveModalInfo: null,
      repositories: { approved: null, rejected: null },
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

      Promise.all([
        this.queryCollections(false),
        this.queryRepositories(),
      ]).then(() => {
        this.setState({ loading: false });
        this.setState({ updatingVersions: [] });
      });
    }
  }

  private queryRepositories() {
    const repoOrNull = (pipeline) =>
      AnsibleRepositoryAPI.list({
        page: 1,
        page_size: 1,
        pulp_label_select: `pipeline=${pipeline}`,
      })
        .then(({ data: { count, results } }) =>
          count === 1 ? results[0] : null,
        )
        .catch((error) => {
          this.addAlert(
            t`Error loading repository with label ${pipeline}.`,
            'danger',
            error?.message,
          );
          return null;
        });

    return Promise.all([repoOrNull('approved'), repoOrNull('rejected')]).then(
      ([approved, rejected]) =>
        this.setState({
          repositories: { approved, rejected },
        }),
    );
  }

  render() {
    const { versions, params, itemCount, loading, unauthorized } = this.state;
    if (!versions && !unauthorized) {
      return <LoadingPageWithHeader />;
    }

    return (
      <>
        <BaseHeader title={t`Approval dashboard`} />
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main className='hub-certification-dashboard'>
            <section className='body' data-cy='body'>
              <div className='hub-toolbar'>
                <Toolbar>
                  <ToolbarContent>
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
                              title: t`Collection name`,
                            },
                            {
                              id: 'repository_label',
                              title: t`Status`,
                              inputType: 'select',
                              options: [
                                {
                                  id: 'pipeline=rejected',
                                  title: t`Rejected`,
                                },
                                {
                                  id: 'pipeline=staging',
                                  title: t`Needs Review`,
                                },
                                {
                                  id: 'pipeline=approved',
                                  title: t`Approved`,
                                },
                              ],
                            },
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                  </ToolbarContent>
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
                    repository_label: {
                      'pipeline=approved': t`Approved`,
                      'pipeline=rejected': t`Rejected`,
                      'pipeline=staging': t`Needs Review`,
                    },
                  }}
                  niceNames={{
                    name: t`Collection name`,
                    namespace: t`Namespace`,
                    repository_label: t`Status`,
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
                collectionVersion={this.state.approveModalInfo}
                addAlert={(alert) => this.addAlertObj(alert)}
              />
            )}
          </Main>
        )}
      </>
    );
  }

  private renderTable(versions, params) {
    if (versions.length === 0) {
      return filterIsSet(params, ['namespace', 'name', 'repository_label']) ? (
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
          id: 'repository_label',
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
          {versions.map((version, i) => (
            <ApprovalRow
              approve={(v) => this.approve(v)}
              collectionVersion={version}
              context={this.context}
              isVersionUpdating={(v) => this.isVersionUpdating(v)}
              key={i}
              openUploadCertificateModal={(v) =>
                this.openUploadCertificateModal(v)
              }
              reject={(v) => this.reject(v)}
            />
          ))}
        </tbody>
      </table>
    );
  }

  private isVersionUpdating(collection: CollectionVersionSearch) {
    return !!this.state.updatingVersions.find((v) => {
      return v == collection;
    });
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
      .then(({ data: { task } }) => waitForTask(task))
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

  private setUpdatingVersion(collectionVersion) {
    const { updatingVersions } = this.state;
    this.setState({
      updatingVersions: [...updatingVersions, collectionVersion],
    });
  }

  private unsetUpdatingVersion(collectionVersion) {
    const { updatingVersions } = this.state;
    this.setState({
      updatingVersions: updatingVersions.filter((v) => v !== collectionVersion),
    });
  }

  private async approve(collection) {
    const { repositories } = this.state;

    if (repositories.approved) {
      this.move(collection, repositories.approved);
    } else {
      this.setState({ approveModalInfo: collection });
    }
  }

  private async reject(collection) {
    const { repositories } = this.state;

    if (!repositories.rejected) {
      const version = collection.collection_version;
      this.addAlert(
        t`Changes to certification status for collection "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
        'danger',
        t`There must be only one repository with pipeline=rejected.`,
      );
      return;
    }

    if (await this.isRejected(collection)) {
      // collection already in rejected repository, so remove it from aproved repo
      this.remove(collection);
    } else {
      // collection is not in rejected state, move it there
      this.move(collection, repositories.rejected);
    }
  }

  private move(collection, destinationRepo) {
    const { collection_version: version, repository: originalRepo } =
      collection;

    this.setUpdatingVersion(collection);
    return Promise.all([
      repositoryBasePath(originalRepo.name, originalRepo.pulp_href),
      repositoryBasePath(destinationRepo.name, destinationRepo.pulp_href),
    ])
      .then(([source, destination]) =>
        CollectionVersionAPI.move(
          version.namespace,
          version.name,
          version.version,
          source,
          destination,
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
      })
      .finally(() => this.unsetUpdatingVersion(collection));
  }

  private remove(collection) {
    const { collection_version: version, repository } = collection;

    this.setUpdatingVersion(collection);
    return AnsibleRepositoryAPI.removeContent(
      parsePulpIDFromURL(repository.pulp_href),
      version.pulp_href,
    )
      .then(({ data: { task } }) => waitForTaskUrl(task))
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
      })
      .finally(() => this.unsetUpdatingVersion(collection));
  }

  // is collection *also* in the rejected repo (regardless of collection.repository)
  // really a "wouldRejectionFail"
  private async isRejected(collection) {
    const { repositories } = this.state;
    const { name, namespace, version } = collection.collection_version;

    return CollectionVersionAPI.list({
      name,
      namespace,
      page: 1,
      page_size: 1,
      repository: parsePulpIDFromURL(repositories.rejected.pulp_href),
      version,
    })
      .then((result) => !!result.data.meta.count)
      .catch(() => false);
  }

  private queryCollections(handleLoading) {
    if (handleLoading) {
      this.setState({
        loading: true,
      });
    }

    const { sort, ...params } = this.state.params;
    const updatedParams = {
      order_by: sort,
      ...params,
    };

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
