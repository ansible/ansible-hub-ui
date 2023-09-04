import { t } from '@lingui/macro';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React from 'react';
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
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import {
  ParamHelper,
  RouteProps,
  errorMessage,
  filterIsSet,
  getCollectionRepoList,
  parsePulpIDFromURL,
  repositoryBasePath,
  repositoryRemoveCollection,
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
  approveModalInfo: {
    collectionVersion;
  };
  approvedRepositoryList: AnsibleRepositoryType[];
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

    if (!params['repository_label']) {
      params['repository_label'] = `pipeline=${Constants.NEEDSREVIEW}`;
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

      promises.push(
        this.loadRepos('staging').then((stagingRepoNames) =>
          this.setState({
            stagingRepoNames,
          }),
        ),
      );
      promises.push(
        this.loadRepos('rejected').then(([rejectedRepoName]) =>
          this.setState({ rejectedRepoName }),
        ),
      );

      promises.push(
        // TODO: replace getAll pagination
        listApproved()
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

  private loadRepos(pipeline) {
    return AnsibleRepositoryAPI.list({
      pulp_label_select: `pipeline=${pipeline}`,
    })
      .then(({ data: { results } }) => (results || []).map(({ name }) => name))
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
      return <LoadingPageWithHeader />;
    }

    return (
      <React.Fragment>
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
                                  id: `pipeline=${Constants.NOTCERTIFIED}`,
                                  title: t`Rejected`,
                                },
                                {
                                  id: `pipeline=${Constants.NEEDSREVIEW}`,
                                  title: t`Needs Review`,
                                },
                                {
                                  id: `pipeline=${Constants.APPROVED}`,
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
                      [`pipeline=${Constants.APPROVED}`]: t`Approved`,
                      [`pipeline=${Constants.NEEDSREVIEW}`]: t`Needs Review`,
                      [`pipeline=${Constants.NOTCERTIFIED}`]: t`Rejected`,
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
    return this.state.updatingVersions.find((v) => {
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

          repositoryRemoveCollection(originalRepo, version.pulp_href)
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

  private updateCertification(version, originalRepo, destinationRepo) {
    // galaxy_ng CollectionRepositoryMixing.get_repos uses the distribution base path to look up repository pk
    // there ..may be room for simplification since we already know the repo; OTOH also compatibility concerns
    return Promise.all([
      repositoryBasePath(originalRepo),
      repositoryBasePath(destinationRepo),
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
      });
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

  // compose from collectionVersionSearch to CollectionVersion structure for approval modal
  async transformToCollectionVersion(collection: CollectionVersionSearch) {
    const repoList = await getCollectionRepoList(collection);

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
