import { Trans, t } from '@lingui/macro';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  List,
  ListItem,
  Modal,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
  Text,
} from '@patternfly/react-core';
import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  CertificateUploadAPI,
  CollectionAPI,
  type CollectionDetailType,
  CollectionVersionAPI,
  type CollectionVersionContentType,
  type CollectionVersionSearch,
  MyNamespaceAPI,
  NamespaceAPI,
  type NamespaceType,
  SignCollectionAPI,
} from 'src/api';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  type BreadcrumbType,
  Breadcrumbs,
  CollectionDropdown,
  CollectionRatings,
  CopyCollectionToRepositoryModal,
  DeleteCollectionModal,
  DownloadCount,
  ExternalLink,
  ImportModal,
  LinkTabs,
  Logo,
  Pagination,
  RepoSelector,
  SignAllCertificatesModal,
  SignSingleCertificateModal,
  UploadSingCertificateModal,
  closeAlertMixin,
} from 'src/components';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  DeleteCollectionUtils,
  ParamHelper,
  canSignNamespace,
  errorMessage,
  namespaceTitle,
  parsePulpIDFromURL,
  repositoryRemoveCollection,
  waitForTask,
} from 'src/utilities';
import { DateComponent } from '../date-component/date-component';
import { SignatureBadge } from '../signing';

interface IProps {
  activeTab: string;
  actuallyCollection: CollectionDetailType;
  breadcrumbs: BreadcrumbType[];
  className?: string;
  collection: CollectionVersionSearch;
  collections: CollectionVersionSearch[];
  collectionsCount: number;
  content: CollectionVersionContentType;
  params: {
    version?: string;
    latestVersion?: string;
  };
  reload: () => void;
  repo?: string;
  updateParams: (params) => void;
}

interface IState {
  alerts: AlertType[];
  collectionVersion: string | null;
  confirmDelete: boolean;
  copyCollectionToRepositoryModal: CollectionVersionSearch;
  deleteAll: boolean;
  deleteCollection: CollectionVersionSearch;
  deletionBlocked: boolean;
  isDeletionPending: boolean;
  isOpenSignAllModal: boolean;
  isOpenSignModal: boolean;
  isOpenVersionsModal: boolean;
  isOpenVersionsSelect: boolean;
  modalCollections: CollectionVersionSearch[];
  modalPagination: {
    page: number;
    page_size: number;
  };
  namespace: NamespaceType;
  redirect: string;
  showImportModal: boolean;
  updateCollection: CollectionVersionSearch;
  uploadCertificateModalOpen: boolean;
  versionToUploadCertificate: CollectionVersionSearch;
}

export class CollectionHeader extends React.Component<IProps, IState> {
  ignoreParams = ['showing', 'keywords'];
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
      collectionVersion: null,
      confirmDelete: false,
      copyCollectionToRepositoryModal: null,
      deleteAll: false,
      deleteCollection: null,
      deletionBlocked: true,
      isDeletionPending: false,
      isOpenSignAllModal: false,
      isOpenSignModal: false,
      isOpenVersionsModal: false,
      isOpenVersionsSelect: false,
      modalCollections: null,
      modalPagination: {
        page: 1,
        page_size: Constants.DEFAULT_PAGINATION_OPTIONS[0],
      },
      namespace: null,
      redirect: null,
      showImportModal: false,
      updateCollection: null,
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: undefined,
    };
  }

  componentDidMount() {
    const { collection } = this.props;
    DeleteCollectionUtils.countUsedbyDependencies(collection)
      .then((count) => this.setState({ deletionBlocked: !!count }))
      .catch((alert) => this.addAlert(alert));

    NamespaceAPI.get(collection.collection_version.namespace, {
      include_related: 'my_permissions',
    }).then(({ data }) => {
      this.setState({ namespace: data });
    });

    this.setState({ modalCollections: this.props.collections });
  }

  componentDidUpdate(prevProps) {
    if (this.props.collections !== prevProps.collections) {
      this.setState({ modalCollections: this.props.collections });
    }
  }

  render() {
    const {
      activeTab,
      actuallyCollection,
      breadcrumbs,
      className,
      collection,
      collections,
      collectionsCount,
      content,
      params,
      updateParams,
    } = this.props;

    const {
      alerts,
      collectionVersion,
      confirmDelete,
      copyCollectionToRepositoryModal,
      deleteAll,
      deleteCollection,
      deletionBlocked,
      isDeletionPending,
      isOpenSignAllModal,
      isOpenSignModal,
      isOpenVersionsModal,
      isOpenVersionsSelect,
      modalCollections,
      modalPagination,
      namespace,
      redirect,
      showImportModal,
      updateCollection,
      uploadCertificateModalOpen,
    } = this.state;

    const {
      featureFlags: { can_upload_signatures, display_signatures },
    } = this.context;

    const urlKeys = [
      { key: 'documentation', name: t`Docs site` },
      { key: 'homepage', name: t`Website` },
      { key: 'issues', name: t`Issue tracker` },
      { key: 'origin_repository', name: t`Repo` },
    ];

    const { collection_version, is_signed, namespace_metadata } = collection;

    const {
      name: collectionName,
      pulp_created: lastUpdated,
      version,
    } = collection_version;

    const latestVersion = collections[0].collection_version.version;

    const versionBadge = ({ pulp_created, version }) =>
      [
        <Trans key={pulp_created}>
          updated <DateComponent date={pulp_created} />
        </Trans>,
        display_signatures ? (is_signed ? t`(signed)` : t`(unsigned)`) : '',
        version === latestVersion ? t`(latest)` : '',
      ]
        .filter(Boolean)
        .map((b, i) => (i ? <> {b}</> : b)); // join with spaces

    const nsTitle = namespaceTitle(
      namespace_metadata || { name: collection_version.namespace },
    );

    if (redirect) {
      return <Navigate to={redirect} />;
    }

    const canSign = canSignNamespace(this.context, this.state.namespace);

    const deleteFromRepo = deleteAll ? null : collection.repository.name;

    const deleteFn = (deleteAll) => ({
      openModal: () => this.openDeleteModalWithConfirm(null, deleteAll),
      skipCheck: true, // already handled by deletionBlocked
    });

    return (
      <>
        {showImportModal && (
          <ImportModal
            isOpen={showImportModal}
            onUploadSuccess={() =>
              this.setState({
                redirect: formatPath(
                  Paths.myImports,
                  {},
                  {
                    namespace: updateCollection.collection_version.namespace,
                  },
                ),
              })
            }
            // onCancel
            setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
            collection={updateCollection.collection_version}
            namespace={updateCollection.collection_version.namespace}
          />
        )}
        {canSign && (
          <>
            <UploadSingCertificateModal
              isOpen={uploadCertificateModalOpen}
              onCancel={() => this.closeUploadCertificateModal()}
              onSubmit={(d) => this.submitCertificate(d)}
            />
            <SignAllCertificatesModal
              name={collectionName}
              isOpen={isOpenSignAllModal}
              onSubmit={this.signCollection}
              onCancel={() => {
                this.setState({ isOpenSignAllModal: false });
              }}
            />
            <SignSingleCertificateModal
              name={collectionName}
              version={version}
              isOpen={isOpenSignModal}
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
                params={modalPagination}
                updateParams={this.updatePaginationParams}
                count={collectionsCount}
              />
            </div>
            {modalCollections ? (
              modalCollections.map(({ collection_version }, i) => (
                <ListItem key={i}>
                  <Button
                    variant='link'
                    isInline
                    onClick={() => {
                      updateParams(
                        ParamHelper.setParam(
                          params,
                          'version',
                          collection_version.version.toString(),
                        ),
                      );
                      this.setState({ isOpenVersionsModal: false });
                    }}
                  >
                    v{collection_version.version}
                  </Button>{' '}
                  {versionBadge(collection_version)}
                </ListItem>
              ))
            ) : (
              <Spinner />
            )}
          </List>
          <Pagination
            params={modalPagination}
            updateParams={this.updatePaginationParams}
            count={collectionsCount}
          />
        </Modal>
        <DeleteCollectionModal
          deleteCollection={deleteCollection}
          collections={collections}
          isDeletionPending={isDeletionPending}
          confirmDelete={confirmDelete}
          setConfirmDelete={(confirmDelete) => this.setState({ confirmDelete })}
          collectionVersion={version}
          cancelAction={() => this.setState({ deleteCollection: null })}
          deleteAction={() =>
            this.setState({ isDeletionPending: true }, () => {
              collectionVersion
                ? this.deleteCollectionVersion(collectionVersion)
                : DeleteCollectionUtils.deleteCollection({
                    collection: deleteCollection,
                    setState: (state) => this.setState(state),
                    load: null,
                    redirect: formatPath(Paths.namespaceDetail, {
                      namespace: deleteCollection.collection_version.namespace,
                    }),
                    addAlert: (alert) => this.context.queueAlert(alert),
                    deleteFromRepo,
                  });
            })
          }
          deleteFromRepo={deleteFromRepo}
        />
        {copyCollectionToRepositoryModal && (
          <CopyCollectionToRepositoryModal
            addAlert={(alert) => this.addAlert(alert)}
            closeAction={() =>
              this.setState({ copyCollectionToRepositoryModal: null })
            }
            collectionVersion={collection}
          />
        )}
        <BaseHeader
          className={className}
          title={collection_version.name}
          logo={
            namespace_metadata?.avatar_url && (
              <Logo
                alt={t`${nsTitle} logo`}
                className='image'
                fallbackToDefault
                image={namespace_metadata.avatar_url}
                size='40px'
                unlockWidth
              />
            )
          }
          contextSelector={
            <RepoSelector selectedRepo={collection.repository.name} />
          }
          breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
          versionControl={
            <div className='column-section'>
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
                    selections={`v${version}`}
                    aria-label={t`Select collection version`}
                    loadingVariant={
                      collections.length < collectionsCount
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
                    {collections
                      .map((c) => c.collection_version)
                      .map((v) => (
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
                          {v.version} {versionBadge(v)}
                        </SelectOption>
                      ))}
                  </Select>
                </div>
                {lastUpdated ? (
                  <span className='last-updated'>
                    <Trans>
                      Last updated <DateComponent date={lastUpdated} />
                    </Trans>
                  </span>
                ) : null}
                {display_signatures ? (
                  <SignatureBadge
                    isCompact
                    signState={is_signed ? 'signed' : 'unsigned'}
                  />
                ) : null}
              </div>
              <div style={{ alignSelf: 'center' }}>
                <CollectionRatings
                  namespace={collection_version.namespace}
                  name={collection_version.name}
                />
                <DownloadCount item={actuallyCollection} />
              </div>
            </div>
          }
          pageControls={
            <Flex>
              <CollectionDropdown
                collection={collection}
                data-cy='kebab-toggle'
                deletionBlocked={deletionBlocked}
                namespace={namespace}
                onCopyVersion={() => this.copyToRepository(collection)}
                onDelete={deleteFn(true)}
                onDeleteVersion={() =>
                  this.openDeleteModalWithConfirm(version, true)
                }
                onDeprecate={() => this.deprecate(collection)}
                onRemove={deleteFn(false)}
                onRemoveVersion={() =>
                  this.openDeleteModalWithConfirm(version, false)
                }
                onSign={() => this.setState({ isOpenSignAllModal: true })}
                onSignVersion={() => {
                  if (can_upload_signatures) {
                    this.setState({
                      uploadCertificateModalOpen: true,
                      versionToUploadCertificate: collection,
                    });
                  } else {
                    this.setState({ isOpenSignModal: true });
                  }
                }}
                onUploadVersion={() => this.checkUploadPrivilleges(collection)}
                version={version}
                wrapper={({ any, children }) =>
                  any ? <FlexItem>{children}</FlexItem> : null
                }
              />
            </Flex>
          }
        >
          {collection.is_deprecated && (
            <Alert
              variant='danger'
              isInline
              title={t`This collection has been deprecated.`}
            />
          )}
          <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
          <div className='hub-tab-link-container'>
            <div className='tabs'>{this.renderTabs(activeTab)}</div>
            <div className='links'>
              {urlKeys.map((link) => {
                const url = content[link.key];
                if (!url) {
                  return null;
                }

                return (
                  <div className='link' key={link.key}>
                    <ExternalLink href={url}>{link.name}</ExternalLink>
                  </div>
                );
              })}
            </div>
          </div>
        </BaseHeader>
      </>
    );
  }

  private checkUploadPrivilleges(collection) {
    const addAlert = () => {
      this.setState({
        alerts: [
          ...this.state.alerts,
          {
            title: t`You don't have rights to do this operation.`,
            variant: 'warning',
          },
        ],
      });
    };

    MyNamespaceAPI.get(collection.collection_version.namespace, {
      include_related: 'my_permissions',
    })
      .then((value) => {
        if (
          value.data.related_fields.my_permissions.includes(
            'galaxy.upload_to_namespace',
          )
        ) {
          this.setState({
            updateCollection: collection,
            showImportModal: true,
          });
        } else {
          addAlert();
        }
      })
      .catch(() => {
        addAlert();
      });
  }

  private renderTabs(active) {
    const { params, collection } = this.props;
    const pathParams = {
      namespace: collection.collection_version.namespace,
      collection: collection.collection_version.name,
      repo: collection.repository.name,
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
      {
        active: active === 'distributions',
        title: t`Distributions`,
        link: formatPath(
          Paths.collectionDistributionsByRepo,
          pathParams,
          reduced,
        ),
      },
    ];

    return <LinkTabs tabs={tabs} />;
  }

  private async submitCertificate(file: File) {
    const { collection_version: version, repository } =
      this.state.versionToUploadCertificate;

    const signed_collection =
      this.props.collection.collection_version.pulp_href;

    this.setState({
      alerts: this.state.alerts.concat({
        id: 'upload-certificate',
        variant: 'info',
        title: t`The certificate for "${version.namespace} ${version.name} v${version.version}" is being uploaded.`,
      }),
    });

    this.closeUploadCertificateModal();

    CertificateUploadAPI.upload({
      file,
      repository: repository.pulp_href,
      signed_collection,
    })
      .then((result) => {
        return waitForTask(parsePulpIDFromURL(result.data.task)).then(() => {
          if (this.props.reload) {
            this.props.reload();
          }
          this.setState({
            alerts: this.state.alerts
              .filter(({ id }) => id !== 'upload-certificate')
              .concat({
                variant: 'success',
                title: t`Certificate for collection "${version.namespace} ${version.name} v${version.version}" has been successfully uploaded.`,
              }),
          });
        });
      })
      .catch((error) => {
        this.setState({
          alerts: this.state.alerts
            .filter(({ id }) => id !== 'upload-certificate')
            .concat({
              variant: 'danger',
              title: t`The certificate for "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
              description: error,
            }),
        });
      });
  }

  private closeUploadCertificateModal() {
    this.setState({
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: undefined,
    });
  }

  private updatePaginationParams = ({ page, page_size }) => {
    const modalPagination = {
      page,
      page_size,
    };

    this.setState({ modalPagination, modalCollections: null });

    const { namespace, name } = this.props.collection.collection_version;
    const repository = this.props.collection.repository;
    const requestParams = {
      ...(repository ? { repository_name: repository.name } : {}),
      namespace,
      name,
    };

    // loadCollections provides initial data, pagination needs extra requests
    CollectionVersionAPI.list({
      ...requestParams,
      order_by: '-version',
      ...modalPagination,
    })
      .then(({ data }) => data)
      .catch(() => ({ data: [] }))
      .then(({ data: modalCollections }) =>
        this.setState({ modalCollections }),
      );
  };

  private signCollection = () => {
    const { namespace, name } = this.props.collection.collection_version;
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign all versions in the collection.`,
      description: t`API Error: ${status}`,
    });

    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          id: 'loading-signing',
          variant: 'success',
          title: t`Signing started for all versions in collection "${name}"`,
        },
      ],
      isOpenSignAllModal: false,
    });

    SignCollectionAPI.sign({
      signing_service: this.context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      repository: this.props.collection.repository,
      namespace,
      collection: name,
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
    const { name, version, namespace } =
      this.props.collection.collection_version;

    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign the version.`,
      description: t`API Error: ${status}`,
    });

    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          id: 'loading-signing',
          variant: 'success',
          title: t`Signing started for collection "${name} v${version}".`,
        },
      ],
      isOpenSignModal: false,
    });

    SignCollectionAPI.sign({
      signing_service: this.context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      repository: this.props.collection.repository,
      namespace,
      collection: name,
      version,
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

  private deprecate(collection) {
    CollectionAPI.setDeprecation(collection)
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        return waitForTask(taskId).then(() => {
          const title = !collection.is_deprecated
            ? t`The collection "${collection.collection_version.name}" has been successfully deprecated.`
            : t`The collection "${collection.collection_version.name}" has been successfully undeprecated.`;
          this.setState({
            alerts: [
              ...this.state.alerts,
              {
                title,
                variant: 'success',
              },
            ],
          });
          if (this.props.reload) {
            this.props.reload();
          }
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        this.setState({
          collectionVersion: null,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: !collection.is_deprecated
                ? t`Collection "${collection.collection_version.name}" could not be deprecated.`
                : t`Collection "${collection.collection_version.name}" could not be undeprecated.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  }

  private deleteCollectionVersion = (collectionVersion) => {
    const { deleteCollection } = this.state;
    const { collections } = this.props;
    const { deleteAll } = this.state;

    let promise = null;

    if (deleteAll) {
      promise = CollectionAPI.deleteCollectionVersion(deleteCollection);
    } else {
      promise = repositoryRemoveCollection(
        deleteCollection.repository.name,
        deleteCollection.collection_version.pulp_href,
      );
    }

    const name = deleteCollection.collection_version.name;

    promise
      .then((res) => {
        if (!deleteAll) {
          return;
        }

        const taskId = parsePulpIDFromURL(res.data.task);
        return waitForTask(taskId);
      })
      .then(() => {
        const topVersion = (collections || []).filter(
          ({ collection_version }) =>
            collection_version.version !== collectionVersion,
        );

        if (topVersion.length) {
          this.props.updateParams(
            ParamHelper.setParam(
              this.props.params,
              'version',
              topVersion[0].collection_version.version,
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
                title: (
                  <Trans>
                    Collection &quot;{name} v{collectionVersion}&quot; has been
                    successfully deleted.
                  </Trans>
                ),
              },
            ],
          });
        } else {
          // last version in collection => collection will be deleted => redirect
          this.context.queueAlert({
            variant: 'success',
            title: (
              <Trans>
                Collection &quot;{name} v{collectionVersion}&quot; has been
                successfully deleted.
              </Trans>
            ),
          });
          this.setState({
            redirect: formatPath(Paths.namespaceDetail, {
              namespace: deleteCollection.collection_version.namespace,
            }),
          });
        }
      })
      .catch((err) => {
        const {
          data: { detail, dependent_collection_versions },
          status,
          statusText,
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
                title: t`Collection "${deleteCollection.collection_version.name} v${collectionVersion}" could not be deleted.`,
                description: errorMessage(status, statusText),
              },
            ],
          });
        }
      });
  };

  private toggleImportModal(isOpen: boolean, warning?: string) {
    if (warning) {
      this.setState({
        alerts: [...this.state.alerts, { title: warning, variant: 'warning' }],
      });
    }
    this.setState({ showImportModal: isOpen });
  }

  private openDeleteModalWithConfirm(version = null, deleteAll = true) {
    this.setState({
      deleteCollection: this.props.collection,
      collectionVersion: version,
      confirmDelete: false,
      deleteAll,
    });
  }

  private copyToRepository(collection: CollectionVersionSearch) {
    this.setState({ copyCollectionToRepositoryModal: collection });
  }

  private closeModal = () => {
    this.setState({ deleteCollection: null });
  };

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  get closeAlert() {
    return closeAlertMixin('alerts');
  }
}
