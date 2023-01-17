import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { errorMessage, DeleteCollectionUtils } from 'src/utilities';
import './header.scss';

import { Navigate } from 'react-router-dom';

import * as moment from 'moment';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
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
  Text,
} from '@patternfly/react-core';
import { AppContext } from 'src/loaders/app-context';

import {
  BaseHeader,
  Breadcrumbs,
  BreadcrumbType,
  LinkTabs,
  Logo,
  RepoSelector,
  Pagination,
  AlertList,
  AlertType,
  closeAlertMixin,
  StatefulDropdown,
  SignSingleCertificateModal,
  SignAllCertificatesModal,
  UploadSingCertificateModal,
  ImportModal,
  DeleteCollectionModal,
} from 'src/components';

import {
  CollectionAPI,
  CollectionDetailType,
  SignCollectionAPI,
  CollectionListType,
  MyNamespaceAPI,
  CollectionVersion,
  Repositories,
  CertificateUploadAPI,
} from 'src/api';
import { Paths, formatPath } from 'src/paths';
import {
  waitForTask,
  canSignNamespace,
  parsePulpIDFromURL,
} from 'src/utilities';
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
  updateCollection: CollectionListType;
  showImportModal: boolean;
  uploadCertificateModalOpen: boolean;
  versionToUploadCertificate: CollectionVersion;
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
      updateCollection: null,
      showImportModal: false,
      uploadCertificateModalOpen: false,
      versionToUploadCertificate: undefined,
    };
  }

  componentDidMount() {
    const { collection } = this.props;
    DeleteCollectionUtils.getUsedbyDependencies(collection)
      .then((noDependencies) => this.setState({ noDependencies }))
      .catch((alert) => this.addAlert(alert));
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
      showImportModal,
      updateCollection,
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
        sign_state: collection.latest_version.sign_state,
      });
    }

    const urlKeys = [
      { key: 'documentation', name: t`Docs site` },
      { key: 'homepage', name: t`Website` },
      { key: 'issues', name: t`Issue tracker` },
      { key: 'repository', name: t`Repo` },
    ];

    const latestVersion = collection.latest_version.created_at;

    const { display_signatures, can_upload_signatures } =
      this.context.featureFlags;

    const signedString = (v) => {
      if (display_signatures && 'sign_state' in v) {
        return v.sign_state === 'signed' ? t`(signed)` : t`(unsigned)`;
      } else {
        return '';
      }
    };

    const isLatestVersion = (v) =>
      `${moment(v.created).fromNow()} ${signedString(v)}
      ${v.version === all_versions[0].version ? t`(latest)` : ''}`;

    const { name: collectionName, namespace } = collection;
    const company = namespace.company || namespace.name;

    if (redirect) {
      return <Navigate to={redirect} />;
    }

    const canSign = canSignNamespace(this.context, namespace);

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
          onClick={() =>
            this.openDeleteModalWithConfirm(collection.latest_version.version)
          }
        >
          {t`Delete version ${collection.latest_version.version}`}
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
                versionToUploadCertificate: collection.latest_version,
              });
            } else {
              this.setState({ isOpenSignModal: true });
            }
          }}
          data-cy='sign-version-button'
        >
          {t`Sign version ${collection.latest_version.version}`}
        </DropdownItem>
      ),
      <DropdownItem onClick={() => this.deprecate(collection)} key='deprecate'>
        {collection.deprecated ? t`Undeprecate` : t`Deprecate`}
      </DropdownItem>,
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
        `${namespace.name}-${collectionName}-${collection.latest_version.version}`,
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
                    namespace: updateCollection.namespace.name,
                  },
                ),
              })
            }
            // onCancel
            setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
            collection={updateCollection}
            namespace={updateCollection.namespace.name}
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
                {t`updated ${isLatestVersion(v)}`}
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
        <DeleteCollectionModal
          deleteCollection={deleteCollection}
          isDeletionPending={isDeletionPending}
          confirmDelete={confirmDelete}
          setConfirmDelete={(confirmDelete) => this.setState({ confirmDelete })}
          collectionVersion={collectionVersion}
          cancelAction={() => this.setState({ deleteCollection: null })}
          deleteAction={() =>
            this.setState({ isDeletionPending: true }, () => {
              collectionVersion
                ? this.deleteCollectionVersion(collectionVersion)
                : DeleteCollectionUtils.deleteCollection({
                    collection: deleteCollection,
                    setState: (state) => this.setState(state),
                    load: null,
                    redirect: formatPath(Paths.namespaceByRepo, {
                      repo: this.context.selectedRepo,
                      namespace: deleteCollection.namespace.name,
                    }),
                    selectedRepo: this.context.selectedRepo,
                    addAlert: (alert) =>
                      this.context.setAlerts([...this.state.alerts, alert]),
                  });
            })
          }
        />
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
              path={Paths.searchByRepo}
              selectedRepo={this.context.selectedRepo}
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
                  signState={collection.latest_version.sign_state}
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

    MyNamespaceAPI.get(collection.namespace.name, {
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

  private async submitCertificate(file: File) {
    const version = this.state.versionToUploadCertificate;
    const response = await Repositories.getRepository({
      name: this.context.selectedRepo,
    });
    const signed_collection = `${PULP_API_BASE_PATH}content/ansible/collection_versions/${version.id}/`;

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
      repository: response.data.results[0].pulp_href,
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
      title: t`Failed to sign all versions in the collection.`,
      description: t`API Error: ${status}`,
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
      distro_base_path: this.context.selectedRepo,
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
      title: t`Failed to sign the version.`,
      description: t`API Error: ${status}`,
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
      distro_base_path: this.context.selectedRepo,
      namespace: this.props.collection.namespace.name,
      collection: this.props.collection.name,
      version: this.props.collection.latest_version.version,
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
    CollectionAPI.setDeprecation(
      collection,
      !collection.deprecated,
      this.context.selectedRepo,
    )
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        return waitForTask(taskId).then(() => {
          const title = !collection.deprecated
            ? t`The collection "${collection.name}" has been successfully deprecated.`
            : t`The collection "${collection.name}" has been successfully undeprecated.`;
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
              title: !collection.deprecated
                ? t`Collection "${collection.name}" could not be deprecated.`
                : t`Collection "${collection.name}" could not be undeprecated.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  }

  private deleteCollectionVersion = (collectionVersion) => {
    const {
      deleteCollection,
      deleteCollection: { name },
    } = this.state;
    CollectionAPI.deleteCollectionVersion(
      this.context.selectedRepo,
      deleteCollection,
    )
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        const name = deleteCollection.name;

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
            this.context.setAlerts([
              ...this.context.alerts,
              {
                variant: 'success',
                title: (
                  <Trans>
                    Collection &quot;{name} v{collectionVersion}&quot; has been
                    successfully deleted.
                  </Trans>
                ),
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
                title: t`Collection "${name} v${collectionVersion}" could not be deleted.`,
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
