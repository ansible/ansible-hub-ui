import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './header.scss';

import { Redirect } from 'react-router-dom';

import * as moment from 'moment';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  Select,
  SelectOption,
  SelectVariant,
  List,
  ListItem,
  Modal,
  Alert,
  Text,
  Button,
  DropdownItem,
  Tooltip,
  Checkbox,
} from '@patternfly/react-core';
import { AppContext } from 'src/loaders/app-context';

import {
  BaseHeader,
  Breadcrumbs,
  LinkTabs,
  Logo,
  RepoSelector,
  Pagination,
  AlertList,
  AlertType,
  closeAlertMixin,
  StatefulDropdown,
  DeleteModal,
  SignSingleCertificateModal,
  SignAllCertificatesModal,
} from 'src/components';

import {
  CollectionAPI,
  CollectionDetailType,
  SignCollectionAPI,
} from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { waitForTask, canSign } from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
import { DateComponent } from '../date-component/date-component';
import { Constants } from 'src/constants';
import { SignatureBadge } from '../signing';

interface IProps {
  collection: CollectionDetailType;
  params: {
    version?: string;
    latestVersion?: string;
  };
  updateParams: (params) => void;
  breadcrumbs: {
    url?: string;
    name: string;
  }[];
  activeTab: string;
  className?: string;
  repo?: string;
}

interface IState {
  isOpenVersionsSelect: boolean;
  isOpenVersionsModal: boolean;
  isOpenSignModal: boolean;
  isOpenSignAllModal: boolean;
  modalPagination: {
    page: number;
    pageSize: number;
  };
  deleteCollection: CollectionDetailType;
  collectionVersion: string | null;
  confirmDelete: boolean;
  alerts: AlertType[];
  redirect: string;
  noDependencies: boolean;
  isDeletionPending: boolean;
}

export class CollectionHeader extends React.Component<IProps, IState> {
  ignoreParams = ['showing', 'keywords'];
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = {
      isOpenVersionsSelect: false,
      isOpenVersionsModal: false,
      isOpenSignModal: false,
      isOpenSignAllModal: false,
      modalPagination: {
        page: 1,
        pageSize: Constants.DEFAULT_PAGINATION_OPTIONS[1],
      },
      deleteCollection: null,
      collectionVersion: null,
      confirmDelete: false,
      alerts: [],
      redirect: null,
      noDependencies: false,
      isDeletionPending: false,
    };
  }

  componentDidMount() {
    this.getUsedbyDependencies();
  }

  render() {
    const {
      collection,
      params,
      updateParams,
      breadcrumbs,
      activeTab,
      className,
    } = this.props;

    const {
      modalPagination,
      isOpenVersionsModal,
      isOpenVersionsSelect,
      redirect,
      noDependencies,
      collectionVersion,
      deleteCollection,
      confirmDelete,
      isDeletionPending,
    } = this.state;

    const numOfshownVersions = 10;

    const all_versions = [...collection.all_versions];

    const match = all_versions.find(
      (x) => x.version === collection.latest_version.version,
    );

    if (!match) {
      all_versions.push({
        id: collection.latest_version.id,
        version: collection.latest_version.version,
        created: collection.latest_version.created_at,
      });
    }

    const urlKeys = [
      { key: 'documentation', name: t`Docs site` },
      { key: 'homepage', name: t`Website` },
      { key: 'issues', name: t`Issue tracker` },
      { key: 'repository', name: t`Repo` },
    ];

    const latestVersion = collection.latest_version.created_at;
    const isVersionSigned =
      collection.latest_version.metadata.signatures?.length > 0;
    const isCollectionSigned = collection.sign_state === 'signed';

    const isLatestVersion = (v) =>
      `${moment(v.created).fromNow()} ${
        v.version === all_versions[0].version ? t`(latest)` : ''
      }`;

    const { name: collectionName } = collection;
    const company = collection.namespace.company || collection.namespace.name;

    if (redirect) {
      return <Redirect push to={redirect} />;
    }

    const dropdownItems = [
      noDependencies
        ? this.context.user.model_permissions.delete_collection && (
            <DropdownItem
              key='delete-collection-enabled'
              onClick={() => this.openDeleteModalWithConfirm()}
              data-cy='delete-collection-dropdown'
            >
              {t`Delete entire collection`}
            </DropdownItem>
          )
        : this.context.user.model_permissions.delete_collection && (
            <Tooltip
              key='delete-collection-disabled'
              position='left'
              content={
                <Trans>
                  Cannot delete until collections <br />
                  that depend on this collection <br />
                  have been deleted.
                </Trans>
              }
            >
              <DropdownItem isDisabled>
                {t`Delete entire collection`}
              </DropdownItem>
            </Tooltip>
          ),
      this.context.user.model_permissions.delete_collection && (
        <DropdownItem
          data-cy='delete-version-dropdown'
          key='delete-collection-version'
          onClick={() =>
            this.openDeleteModalWithConfirm(collection.latest_version.version)
          }
        >
          {t`Delete version ${collection.latest_version.version}`}
        </DropdownItem>
      ),
      canSign(this.context) && !isCollectionSigned && (
        <DropdownItem
          key='sign-all'
          onClick={() => this.setState({ isOpenSignAllModal: true })}
        >
          {`Sign entire collection`}
        </DropdownItem>
      ),
      canSign(this.context) && !isVersionSigned && (
        <DropdownItem
          key='sign-version'
          onClick={() => this.setState({ isOpenSignModal: true })}
        >
          {t`Sign version ${collection.latest_version.version}`}
        </DropdownItem>
      ),
    ].filter(Boolean);

    return (
      <React.Fragment>
        {canSign(this.context) && (
          <>
            <SignAllCertificatesModal
              name={collectionName}
              numberOfAffected={collection.all_versions.length}
              isOpen={this.state.isOpenSignAllModal}
              onSubmit={this.signCollection}
              onCancel={() => {
                this.setState({ isOpenSignAllModal: false });
              }}
            />
            <SignSingleCertificateModal
              name={collectionName}
              version={collection.latest_version.version}
              isOpen={this.state.isOpenSignModal}
              onSubmit={this.signVersion}
              onCancel={() => this.setState({ isOpenSignModal: false })}
            />
          </>
        )}
        <Modal
          isOpen={isOpenVersionsModal}
          title={t`Collection versions`}
          variant='small'
          onClose={() => this.setState({ isOpenVersionsModal: false })}
        >
          <List isPlain>
            <div className='versions-modal-header'>
              <Text>{t`${collectionName}'s versions.`}</Text>
              <Pagination
                isTop
                params={{
                  page: modalPagination.page,
                  page_size: modalPagination.pageSize,
                }}
                updateParams={this.updatePaginationParams}
                count={all_versions.length}
              />
            </div>
            {this.paginateVersions(all_versions).map((v, i) => (
              <ListItem key={i}>
                <Button
                  variant='link'
                  isInline
                  onClick={() => {
                    updateParams(
                      ParamHelper.setParam(
                        params,
                        'version',
                        v.version.toString(),
                      ),
                    );
                    this.setState({ isOpenVersionsModal: false });
                  }}
                >
                  v{v.version}
                </Button>{' '}
                {t`released ${isLatestVersion(v)}`}
              </ListItem>
            ))}
          </List>
          <Pagination
            params={{
              page: modalPagination.page,
              page_size: modalPagination.pageSize,
            }}
            updateParams={this.updatePaginationParams}
            count={all_versions.length}
          />
        </Modal>
        {deleteCollection && (
          <DeleteModal
            spinner={isDeletionPending}
            cancelAction={this.closeModal}
            deleteAction={() =>
              this.setState({ isDeletionPending: true }, () => {
                collectionVersion
                  ? this.deleteCollectionVersion(collectionVersion)
                  : this.deleteCollection();
              })
            }
            isDisabled={!confirmDelete || isDeletionPending}
            title={
              collectionVersion
                ? t`Delete collection version?`
                : t`Delete collection?`
            }
          >
            <>
              <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
                {collectionVersion ? (
                  <>
                    {deleteCollection.all_versions.length === 1 ? (
                      <Trans>
                        Deleting{' '}
                        <b>
                          {deleteCollection.name} v{collectionVersion}
                        </b>{' '}
                        and its data will be lost and this will cause the entire
                        collection to be deleted.
                      </Trans>
                    ) : (
                      <Trans>
                        Deleting{' '}
                        <b>
                          {deleteCollection.name} v{collectionVersion}
                        </b>{' '}
                        and its data will be lost.
                      </Trans>
                    )}
                  </>
                ) : (
                  <Trans>
                    Deleting <b>{deleteCollection.name}</b> and its data will be
                    lost.
                  </Trans>
                )}
              </Text>
              <Checkbox
                isChecked={confirmDelete}
                onChange={(val) => this.setState({ confirmDelete: val })}
                label={t`I understand that this action cannot be undone.`}
                id='delete_confirm'
              />
            </>
          </DeleteModal>
        )}
        <BaseHeader
          className={className}
          title={collection.name}
          logo={
            collection.namespace.avatar_url && (
              <Logo
                alt={t`${company} logo`}
                className='image'
                fallbackToDefault
                image={collection.namespace.avatar_url}
                size='40px'
                unlockWidth
              />
            )
          }
          contextSelector={
            <RepoSelector
              selectedRepo={this.context.selectedRepo}
              path={Paths.searchByRepo}
              isDisabled
            />
          }
          breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
          versionControl={
            <div className='install-version-column'>
              <span>{t`Version`}</span>
              <div className='install-version-dropdown'>
                <Select
                  isOpen={isOpenVersionsSelect}
                  onToggle={(isOpenVersionsSelect) =>
                    this.setState({ isOpenVersionsSelect })
                  }
                  variant={SelectVariant.single}
                  onSelect={() =>
                    this.setState({ isOpenVersionsSelect: false })
                  }
                  selections={`v${collection.latest_version.version}`}
                  aria-label={t`Select collection version`}
                  loadingVariant={
                    numOfshownVersions < all_versions.length
                      ? {
                          text: t`View more`,
                          onClick: () =>
                            this.setState({
                              isOpenVersionsModal: true,
                              isOpenVersionsSelect: false,
                            }),
                        }
                      : null
                  }
                >
                  {this.renderSelectVersions(
                    all_versions,
                    numOfshownVersions,
                  ).map((v) => (
                    <SelectOption
                      key={v.version}
                      value={`v${v.version}`}
                      onClick={() =>
                        updateParams(
                          ParamHelper.setParam(
                            params,
                            'version',
                            v.version.toString(),
                          ),
                        )
                      }
                    >
                      <Trans>
                        {v.version} released {isLatestVersion(v)}
                      </Trans>
                    </SelectOption>
                  ))}
                </Select>
              </div>
              {latestVersion ? (
                <span className='last-updated'>
                  <Trans>
                    Last updated <DateComponent date={latestVersion} />
                  </Trans>
                </span>
              ) : null}
              <SignatureBadge isCompact isSigned={isVersionSigned} />
            </div>
          }
          pageControls={
            dropdownItems.length > 0 ? (
              <div data-cy='kebab-toggle'>
                <StatefulDropdown items={dropdownItems} />
              </div>
            ) : null
          }
        >
          {collection.deprecated && (
            <Alert
              variant='danger'
              isInline
              title={t`This collection has been deprecated.`}
            />
          )}
          <AlertList
            alerts={this.state.alerts}
            closeAlert={(i) => this.closeAlert(i)}
          />
          <div className='hub-tab-link-container'>
            <div className='tabs'>{this.renderTabs(activeTab)}</div>
            <div className='links'>
              <div>
                <ExternalLinkAltIcon />
              </div>
              {urlKeys.map((link) => {
                const url = collection.latest_version.metadata[link.key];
                if (!url) {
                  return null;
                }

                return (
                  <div className='link' key={link.key}>
                    <a href={url} target='_blank' rel='noreferrer'>
                      {link.name}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </BaseHeader>
      </React.Fragment>
    );
  }

  private renderTabs(active) {
    const { params, repo } = this.props;

    const pathParams = {
      namespace: this.props.collection.namespace.name,
      collection: this.props.collection.name,
      repo: repo,
    };
    const reduced = ParamHelper.getReduced(params, this.ignoreParams);

    const tabs = [
      {
        active: active === 'install',
        title: t`Install`,
        link: formatPath(Paths.collectionByRepo, pathParams, reduced),
      },
      {
        active: active === 'documentation',
        title: t`Documentation`,
        link: formatPath(Paths.collectionDocsIndexByRepo, pathParams, reduced),
      },
      {
        active: active === 'contents',
        title: t`Contents`,
        link: formatPath(
          Paths.collectionContentListByRepo,
          pathParams,
          reduced,
        ),
      },
      {
        active: active === 'import-log',
        title: t`Import log`,
        link: formatPath(Paths.collectionImportLogByRepo, pathParams, reduced),
      },
      {
        active: active === 'dependencies',
        title: t`Dependencies`,
        link: formatPath(
          Paths.collectionDependenciesByRepo,
          pathParams,
          reduced,
        ),
      },
    ];

    return <LinkTabs tabs={tabs} />;
  }

  private renderSelectVersions(versions, count) {
    return versions.slice(0, count);
  }

  private paginateVersions(versions) {
    const { modalPagination } = this.state;
    return versions.slice(
      modalPagination.pageSize * (modalPagination.page - 1),
      modalPagination.pageSize * modalPagination.page,
    );
  }

  private updatePaginationParams = ({ page, page_size }) => {
    this.setState({
      modalPagination: {
        page: page,
        pageSize: page_size,
      },
    });
  };

  private signCollection = () => {
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`API Error: ${status}`,
      description: t`Failed to sign all versions in the collection.`,
    });

    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          id: 'loading-signing',
          variant: 'success',
          title: t`Signing started for all versions in collection "${this.props.collection.name}"`,
        },
      ],
      isOpenSignAllModal: false,
    });

    SignCollectionAPI.sign({
      signing_service: this.context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      repository: this.context.selectedRepo,
      namespace: this.props.collection.namespace.name,
      collection: this.props.collection.name,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => {
            this.props.updateParams({});
          })
          .catch((error) => {
            this.setState({
              alerts: [...this.state.alerts, errorAlert(error)],
            });
          })
          .finally(() => {
            this.setState({
              alerts: this.state.alerts.filter(
                (x) => x?.id !== 'loading-signing',
              ),
            });
          });
      })
      .catch((error) => {
        // The request failed in the first place
        this.setState({
          alerts: [...this.state.alerts, errorAlert(error.response.status)],
        });
      });
  };

  private signVersion = () => {
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`API Error: ${status}`,
      description: t`Failed to sign the version.`,
    });

    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          id: 'loading-signing',
          variant: 'success',
          title: t`Signing started for collection "${this.props.collection.name} v${this.props.collection.latest_version.version}".`,
        },
      ],
      isOpenSignModal: false,
    });

    SignCollectionAPI.sign({
      signing_service: this.context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      repository: this.context.selectedRepo,
      namespace: this.props.collection.namespace.name,
      collection: this.props.collection.name,
      version: this.props.collection.latest_version.version,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            this.setState({
              alerts: [...this.state.alerts, errorAlert(error)],
            });
          })
          .finally(() => {
            this.setState({
              alerts: this.state.alerts.filter(
                (x) => x?.id !== 'loading-signing',
              ),
            });
          });
      })
      .catch((error) => {
        // The request failed in the first place
        this.setState({
          alerts: [...this.state.alerts, errorAlert(error.response.status)],
        });
      });
  };

  private deleteCollectionVersion = (collectionVersion) => {
    const { deleteCollection } = this.state;

    CollectionAPI.deleteCollectionVersion(
      this.context.selectedRepo,
      deleteCollection,
    )
      .then((res) => {
        const taskId = this.getIdFromTask(res.data.task);

        waitForTask(taskId).then(() => {
          if (deleteCollection.all_versions.length > 1) {
            const topVersion = deleteCollection.all_versions.filter(
              ({ version }) => version !== collectionVersion,
            );
            this.props.updateParams(
              ParamHelper.setParam(
                this.props.params,
                'version',
                topVersion[0].version,
              ),
            );

            this.setState({
              deleteCollection: null,
              collectionVersion: null,
              isDeletionPending: false,
              alerts: [
                ...this.state.alerts,
                {
                  variant: 'success',
                  title: t`Successfully deleted collection version.`,
                },
              ],
            });
          } else {
            // last version in collection => collection will be deleted => redirect
            this.context.setAlerts([
              ...this.context.alerts,
              {
                variant: 'success',
                title: t`Successfully deleted collection.`,
              },
            ]);
            this.setState({
              redirect: formatPath(Paths.namespaceByRepo, {
                repo: this.context.selectedRepo,
                namespace: deleteCollection.namespace.name,
              }),
            });
          }
        });
      })
      .catch((err) => {
        const {
          data: { detail, dependent_collection_versions },
          status,
        } = err.response;

        if (status === 400) {
          const dependencies = (
            <>
              <Trans>Dependent collections</Trans>
              <List className='dependent-collections-alert-list'>
                {dependent_collection_versions.map((d) => (
                  <ListItem key={d}>{d}</ListItem>
                ))}
              </List>
            </>
          );
          this.setState({
            deleteCollection: null,
            collectionVersion: null,
            isDeletionPending: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: detail,
                description: dependencies,
              },
            ],
          });
        } else {
          this.setState({
            deleteCollection: null,
            collectionVersion: null,
            isDeletionPending: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Error deleting collection version.`,
                description: err?.message,
              },
            ],
          });
        }
      });
  };

  private deleteCollection = () => {
    const { deleteCollection } = this.state;
    CollectionAPI.deleteCollection(this.context.selectedRepo, deleteCollection)
      .then((res) => {
        const taskId = this.getIdFromTask(res.data.task);

        waitForTask(taskId).then(() => {
          this.context.setAlerts([
            ...this.context.alerts,
            {
              variant: 'success',
              title: t`Successfully deleted collection.`,
            },
          ]);
          this.setState({
            collectionVersion: null,
            deleteCollection: null,
            isDeletionPending: false,
            redirect: formatPath(Paths.namespaceByRepo, {
              repo: this.context.selectedRepo,
              namespace: deleteCollection.namespace.name,
            }),
          });
        });
      })
      .catch((err) =>
        this.setState({
          collectionVersion: null,
          deleteCollection: null,
          isDeletionPending: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error deleting collection.`,
              description: err?.message,
            },
          ],
        }),
      );
  };

  private openDeleteModalWithConfirm(version = null) {
    this.setState({
      deleteCollection: this.props.collection,
      collectionVersion: version,
      confirmDelete: false,
    });
  }

  private getUsedbyDependencies() {
    const { name, namespace } = this.props.collection;
    CollectionAPI.getUsedDependenciesByCollection(namespace.name, name)
      .then(({ data }) => {
        this.setState({ noDependencies: !data.data.length });
      })
      .catch((err) =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error getting collection's dependencies.`,
              description: err?.message,
            },
          ],
        }),
      );
  }

  private getIdFromTask(task) {
    return task.match(/tasks\/([a-zA-Z0-9-]+)/i)[1];
  }
  private closeModal = () => {
    this.setState({ deleteCollection: null });
  };

  get closeAlert() {
    return closeAlertMixin('alerts');
  }
}
