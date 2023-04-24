import { Trans, t } from '@lingui/macro';
import {
  Alert,
  Button,
  DropdownItem,
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
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import * as moment from 'moment';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import {
  CertificateUploadAPI,
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionContentType,
  CollectionVersionSearch,
  MyNamespaceAPI,
  NamespaceAPI,
  NamespaceType,
  SignCollectionAPI,
} from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  BreadcrumbType,
  Breadcrumbs,
  DeleteCollectionModal,
  ImportModal,
  LinkTabs,
  Logo,
  Pagination,
  RepoSelector,
  SignAllCertificatesModal,
  SignSingleCertificateModal,
  StatefulDropdown,
  UploadSingCertificateModal,
  closeAlertMixin,
} from 'src/components';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { DeleteCollectionUtils, errorMessage } from 'src/utilities';
import {
  canSignNamespace,
  parsePulpIDFromURL,
  waitForTask,
} from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
import { DateComponent } from '../date-component/date-component';
import { SignatureBadge } from '../signing';
import './header.scss';

interface IProps {
  collections: CollectionVersionSearch[];
  collectionsCount: number;
  collection: CollectionVersionSearch;
  content: CollectionVersionContentType;
  params: {
    version?: string;
    latestVersion?: string;
  };
  updateParams: (params) => void;
  breadcrumbs: BreadcrumbType[];
  activeTab: string;
  className?: string;
  repo?: string;
  reload: () => void;
}

interface IState {
  isOpenVersionsSelect: boolean;
  isOpenVersionsModal: boolean;
  isOpenSignModal: boolean;
  isOpenSignAllModal: boolean;
  modalCollections: CollectionVersionSearch[];
  modalPagination: {
    page: number;
    page_size: number;
  };
  deleteCollection: CollectionVersionSearch;
  collectionVersion: string | null;
  confirmDelete: boolean;
  alerts: AlertType[];
  redirect: string;
  noDependencies: boolean;
  isDeletionPending: boolean;
  updateCollection: CollectionVersionSearch;
  showImportModal: boolean;
  uploadCertificateModalOpen: boolean;
  versionToUploadCertificate: CollectionVersionSearch;
  namespace: NamespaceType;
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
      modalCollections: null,
      modalPagination: {
        page: 1,
        page_size: Constants.DEFAULT_PAGINATION_OPTIONS[0],
      },
      deleteCollection: null,
      collectionVersion: null,
      confirmDelete: false,
      alerts: [],
      redirect: null,
      noDependencies: false,
      isDeletionPending: false,
      updateCollection: null,
      showImportModal: false,
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: undefined,
      namespace: null,
    };
  }

  componentDidMount() {
    const { collection } = this.props;
    DeleteCollectionUtils.getUsedbyDependencies(collection)
      .then((noDependencies) => this.setState({ noDependencies }))
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
      collections,
      collectionsCount,
      collection,
      content,
      params,
      updateParams,
      breadcrumbs,
      activeTab,
      className,
    } = this.props;

    const {
      modalCollections,
      modalPagination,
      isOpenVersionsModal,
      isOpenVersionsSelect,
      redirect,
      noDependencies,
      collectionVersion,
      deleteCollection,
      confirmDelete,
      isDeletionPending,
      showImportModal,
      updateCollection,
    } = this.state;

    const urlKeys = [
      { key: 'documentation', name: t`Docs site` },
      { key: 'homepage', name: t`Website` },
      { key: 'issues', name: t`Issue tracker` },
      { key: 'origin_repository', name: t`Repo` },
    ];

    const latestVersion = collection.collection_version.pulp_created;

    const { display_signatures, can_upload_signatures } =
      this.context.featureFlags;

    const signedString = () => {
      if (!display_signatures) {
        return '';
      }

      return collection.is_signed ? t`(signed)` : t`(unsigned)`;
    };

    const isLatestVersion = (v) => {
      return `${moment(v.pulp_created).fromNow()} ${signedString()}
      ${
        v.version === collections[0].collection_version.version
          ? t`(latest)`
          : ''
      }`;
    };

    const { collection_version, namespace_metadata: namespace } = collection;
    const { name: collectionName, version } = collection_version;

    const company = namespace?.company || collection_version.namespace;

    if (redirect) {
      return <Navigate to={redirect} />;
    }

    const canSign = canSignNamespace(this.context, this.state.namespace);

    const { hasPermission } = this.context;

    const dropdownItems = [
      DeleteCollectionUtils.deleteMenuOption({
        canDeleteCollection: hasPermission('ansible.delete_collection'),
        noDependencies,
        onClick: () => this.openDeleteModalWithConfirm(),
      }),
      hasPermission('ansible.delete_collection') && (
        <DropdownItem
          data-cy='delete-version-dropdown'
          key='delete-collection-version'
          onClick={() => this.openDeleteModalWithConfirm(version)}
        >
          {t`Delete version ${version}`}
        </DropdownItem>
      ),
      canSign && !can_upload_signatures && (
        <DropdownItem
          key='sign-all'
          data-cy='sign-collection-button'
          onClick={() => this.setState({ isOpenSignAllModal: true })}
        >
          {t`Sign entire collection`}
        </DropdownItem>
      ),
      canSign && (
        <DropdownItem
          key='sign-version'
          onClick={() => {
            if (can_upload_signatures) {
              this.setState({
                uploadCertificateModalOpen: true,
                versionToUploadCertificate: collection,
              });
            } else {
              this.setState({ isOpenSignModal: true });
            }
          }}
          data-cy='sign-version-button'
        >
          {t`Sign version ${version}`}
        </DropdownItem>
      ),
      hasPermission('galaxy.upload_to_namespace') && (
        <DropdownItem
          onClick={() => this.deprecate(collection)}
          key='deprecate'
        >
          {collection.is_deprecated ? t`Undeprecate` : t`Deprecate`}
        </DropdownItem>
      ),
      <DropdownItem
        key='upload-collection-version'
        onClick={() => this.checkUploadPrivilleges(collection)}
        data-cy='upload-collection-version-dropdown'
      >
        {t`Upload new version`}
      </DropdownItem>,
    ].filter(Boolean);

    const issueUrl =
      'https://access.redhat.com/support/cases/#/case/new/open-case/describe-issue/recommendations?caseCreate=true&product=Ansible%20Automation%20Hub&version=Online&summary=' +
      encodeURIComponent(
        `${collection_version.namespace}-${collectionName}-${version}`,
      );

    return (
      <React.Fragment>
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
              isOpen={this.state.uploadCertificateModalOpen}
              onCancel={() => this.closeUploadCertificateModal()}
              onSubmit={(d) => this.submitCertificate(d)}
            />
            <SignAllCertificatesModal
              name={collectionName}
              isOpen={this.state.isOpenSignAllModal}
              onSubmit={this.signCollection}
              onCancel={() => {
                this.setState({ isOpenSignAllModal: false });
              }}
            />
            <SignSingleCertificateModal
              name={collectionName}
              version={version}
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
                  {t`updated ${isLatestVersion(collection_version)}`}
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
                  });
            })
          }
        />
        <BaseHeader
          className={className}
          title={collection_version.name}
          logo={
            namespace?.avatar_url && (
              <Logo
                alt={t`${company} logo`}
                className='image'
                fallbackToDefault
                image={namespace.avatar_url}
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
                        <Trans>
                          {v.version} updated {isLatestVersion(v)}
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
              {display_signatures ? (
                <SignatureBadge
                  isCompact
                  signState={collection.is_signed ? 'signed' : 'unsigned'}
                />
              ) : null}
            </div>
          }
          pageControls={
            <Flex>
              {DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE ? (
                <FlexItem>
                  <a href={issueUrl} target='_blank' rel='noreferrer'>
                    {t`Create issue`}
                  </a>{' '}
                  <ExternalLinkAltIcon />
                </FlexItem>
              ) : null}
              {dropdownItems.length > 0 ? (
                <FlexItem data-cy='kebab-toggle'>
                  <StatefulDropdown items={dropdownItems} />
                </FlexItem>
              ) : null}
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
                const url = content[link.key];
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
      namespace: namespace,
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
      namespace: namespace,
      collection: name,
      version: version,
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
                title: title,
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
    CollectionAPI.deleteCollectionVersion(deleteCollection)
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        const name = deleteCollection.collection_version.name;

        waitForTask(taskId).then(() => {
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
                      Collection &quot;{name} v{collectionVersion}&quot; has
                      been successfully deleted.
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
        });
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

  private openDeleteModalWithConfirm(version = null) {
    this.setState({
      deleteCollection: this.props.collection,
      collectionVersion: version,
      confirmDelete: false,
    });
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
