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
  Text,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import * as moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  CertificateUploadAPI,
  CollectionAPI,
  CollectionDetailType,
  CollectionListType,
  CollectionVersion,
  MyNamespaceAPI,
  Repositories,
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
} from 'src/components';
import { Constants } from 'src/constants';
import { useContext } from 'src/loaders/app-context';
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

export const CollectionHeader = (props: IProps) => {
  let ignoreParams = ['showing', 'keywords'];
  const context = useContext();

  /*this.state = {
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
  }*/

  const [isOpenVersionsSelect, setIsOpenVersionsSelect] = useState(false);
  const [isOpenVersionsModal, setIsOpenVersionsModal] = useState(false);
  const [isOpenSignModal, setIsOpenSignModal] = useState(false);
  const [isOpenSignAllModal, setIsOpenSignAllModal] = useState(false);
  const [modalPagination, setModalPagination] = useState({
    page: 1,
    pageSize: Constants.DEFAULT_PAGINATION_OPTIONS[1],
  });
  const [deleteCollection, setDeleteCollection] = useState(null);
  const [collectionVersion, setCollectionVersion] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [redirect, setRedirect] = useState(null);
  const [noDependencies, setNoDependencies] = useState(false);
  const [isDeletionPending, setIsDeletionPending] = useState(false);
  const [updateCollection, setUpdateCollection] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadCertificateModalOpen, setUploadCertificateModalOpen] =
    useState(false);
  const [versionToUploadCertificate, setVersionToUploadCertificate] =
    useState(undefined);

  useEffect(() => {
    const { collection } = props;
    DeleteCollectionUtils.getUsedbyDependencies(collection)
      .then((noDependencies) => setNoDependencies(noDependencies))
      .catch((alert) => addAlert(alert));
  });

  const {
    collection,
    params,
    updateParams,
    breadcrumbs,
    activeTab,
    className,
  } = props;

  /*const {
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
    } = this.state;*/

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

  const { display_signatures, can_upload_signatures } = context.featureFlags;

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

  const canSign = canSignNamespace(context, namespace);

  const { hasPermission } = context;

  const dropdownItems = [
    DeleteCollectionUtils.deleteMenuOption({
      canDeleteCollection: hasPermission('ansible.delete_collection'),
      noDependencies,
      onClick: () => openDeleteModalWithConfirm(),
    }),
    hasPermission('ansible.delete_collection') && (
      <DropdownItem
        data-cy='delete-version-dropdown'
        key='delete-collection-version'
        onClick={() =>
          openDeleteModalWithConfirm(collection.latest_version.version)
        }
      >
        {t`Delete version ${collection.latest_version.version}`}
      </DropdownItem>
    ),
    canSign && !can_upload_signatures && (
      <DropdownItem
        key='sign-all'
        data-cy='sign-collection-button'
        onClick={() => setIsOpenSignAllModal(true)}
      >
        {t`Sign entire collection`}
      </DropdownItem>
    ),
    canSign && (
      <DropdownItem
        key='sign-version'
        onClick={() => {
          if (can_upload_signatures) {
            /*this.setState({
                uploadCertificateModalOpen: true,
                versionToUploadCertificate: collection.latest_version,
              });*/
            setUploadCertificateModalOpen(true);
            setVersionToUploadCertificate(collection.latest_version);
          } else {
            //this.setState({ isOpenSignModal: true });
            setIsOpenSignAllModal(true);
          }
        }}
        data-cy='sign-version-button'
      >
        {t`Sign version ${collection.latest_version.version}`}
      </DropdownItem>
    ),
    <DropdownItem onClick={() => deprecate(collection)} key='deprecate'>
      {collection.deprecated ? t`Undeprecate` : t`Deprecate`}
    </DropdownItem>,
    <DropdownItem
      key='upload-collection-version'
      onClick={() => checkUploadPrivilleges(collection)}
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

  const checkUploadPrivilleges = (collection) => {
    const customAlert: AlertType = {
      title: t`You don't have rights to do this operation.`,
      variant: 'warning',
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
          setUpdateCollection(collection);
          setShowImportModal(true);
        } else {
          addAlert(customAlert);
        }
      })
      .catch(() => {
        addAlert(customAlert);
      });
  };

  const renderTabs = (active) => {
    const { params, repo } = props;

    const pathParams = {
      namespace: props.collection.namespace.name,
      collection: props.collection.name,
      repo: repo,
    };
    const reduced = ParamHelper.getReduced(params, ignoreParams);

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
  };

  const renderSelectVersions = (versions, count) => {
    return versions.slice(0, count);
  };

  const submitCertificate = async (file: File) => {
    const version = versionToUploadCertificate;
    const response = await Repositories.getRepository({
      name: context.selectedRepo,
    });
    const signed_collection = `${PULP_API_BASE_PATH}content/ansible/collection_versions/${version.id}/`;

    addAlert({
      id: 'upload-certificate',
      variant: 'info',
      title: t`The certificate for "${version.namespace} ${version.name} v${version.version}" is being uploaded.`,
    });

    closeUploadCertificateModal();

    CertificateUploadAPI.upload({
      file,
      repository: response.data.results[0].pulp_href,
      signed_collection,
    })
      .then((result) => {
        return waitForTask(parsePulpIDFromURL(result.data.task)).then(() => {
          if (props.reload) {
            props.reload();
          }
          setAlerts(
            alerts
              .filter(({ id }) => id !== 'upload-certificate')
              .concat({
                variant: 'success',
                title: t`Certificate for collection "${version.namespace} ${version.name} v${version.version}" has been successfully uploaded.`,
              }),
          );
        });
      })
      .catch((error) => {
        setAlerts(
          alerts
            .filter(({ id }) => id !== 'upload-certificate')
            .concat({
              variant: 'danger',
              title: t`The certificate for "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
              description: error,
            }),
        );
      });
  };

  const closeUploadCertificateModal = () => {
    setUploadCertificateModalOpen(false);
    setVersionToUploadCertificate(undefined);
  };

  const paginateVersions = (versions) => {
    return versions.slice(
      modalPagination.pageSize * (modalPagination.page - 1),
      modalPagination.pageSize * modalPagination.page,
    );
  };

  const updatePaginationParams = ({ page, page_size }) => {
    setModalPagination({
      page: page,
      pageSize: page_size,
    });
  };

  const signCollection = () => {
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign all versions in the collection.`,
      description: t`API Error: ${status}`,
    });

    addAlert({
      id: 'loading-signing',
      variant: 'success',
      title: t`Signing started for all versions in collection "${props.collection.name}"`,
    });

    setIsOpenSignAllModal(false);

    SignCollectionAPI.sign({
      signing_service: context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      distro_base_path: context.selectedRepo,
      namespace: props.collection.namespace.name,
      collection: props.collection.name,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => {
            props.updateParams({});
          })
          .catch((error) => {
            addAlert(errorAlert(error));
          })
          .finally(() => {
            setAlerts(alerts.filter((x) => x?.id !== 'loading-signing'));
          });
      })
      .catch((error) => {
        // The request failed in the first place
        addAlert(errorAlert(error.response.status));
      });
  };

  const signVersion = () => {
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign the version.`,
      description: t`API Error: ${status}`,
    });

    addAlert({
      id: 'loading-signing',
      variant: 'success',
      title: t`Signing started for collection "${props.collection.name} v${props.collection.latest_version.version}".`,
    });

    setIsOpenSignModal(false);

    SignCollectionAPI.sign({
      signing_service: context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      distro_base_path: context.selectedRepo,
      namespace: props.collection.namespace.name,
      collection: props.collection.name,
      version: props.collection.latest_version.version,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => {
            props.updateParams({});
          })
          .catch((error) => {
            addAlert(errorAlert(error));
          })
          .finally(() => {
            setAlerts(alerts.filter((x) => x?.id !== 'loading-signing'));
          });
      })
      .catch((error) => {
        // The request failed in the first place
        addAlert(errorAlert(error.response.status));
      });
  };

  const deprecate = (collection) => {
    CollectionAPI.setDeprecation(
      collection,
      !collection.deprecated,
      context.selectedRepo,
    )
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        return waitForTask(taskId).then(() => {
          const title = !collection.deprecated
            ? t`The collection "${collection.name}" has been successfully deprecated.`
            : t`The collection "${collection.name}" has been successfully undeprecated.`;
          addAlert({
            title: title,
            variant: 'success',
          });

          if (props.reload) {
            props.reload();
          }
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        /*this.setState({
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
        });*/
        setCollectionVersion(null);
        addAlert({
          variant: 'danger',
          title: !collection.deprecated
            ? t`Collection "${collection.name}" could not be deprecated.`
            : t`Collection "${collection.name}" could not be undeprecated.`,
          description: errorMessage(status, statusText),
        });
      });
  };

  const deleteCollectionVersion = (collectionVersion) => {
    // what is this?
    /*
    const {
      deleteCollection,
      deleteCollection: { name },
    } = this.state;*/

    CollectionAPI.deleteCollectionVersion(
      context.selectedRepo,
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

            props.updateParams(
              ParamHelper.setParam(
                props.params,
                'version',
                topVersion[0].version,
              ),
            );

            /*this.setState({
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
            });*/

            setDeleteCollection(null);
            setCollectionVersion(null);
            setIsDeletionPending(false);
            addAlert({
              variant: 'success',
              title: (
                <Trans>
                  Collection &quot;{name} v{collectionVersion}&quot; has been
                  successfully deleted.
                </Trans>
              ),
            });
          } else {
            // last version in collection => collection will be deleted => redirect
            addAlert({
              variant: 'success',
              title: (
                <Trans>
                  Collection &quot;{name} v{collectionVersion}&quot; has been
                  successfully deleted.
                </Trans>
              ),
            });

            setRedirect(
              formatPath(Paths.namespaceByRepo, {
                repo: context.selectedRepo,
                namespace: deleteCollection.namespace.name,
              }),
            );
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

          setDeleteCollection(null);
          setCollectionVersion(null);
          setIsDeletionPending(false);
          addAlert({
            variant: 'danger',
            title: detail,
            description: dependencies,
          });
        } else {
          setDeleteCollection(null);
          setCollectionVersion(null);
          setIsDeletionPending(false);

          addAlert({
            variant: 'danger',
            title: t`Collection "${name} v${collectionVersion}" could not be deleted.`,
            description: errorMessage(status, statusText),
          });
        }
      });
  };

  const toggleImportModal = (isOpen: boolean, warning?: string) => {
    if (warning) {
      addAlert({ title: warning, variant: 'warning' });
    }
    setShowImportModal(isOpen);
  };

  const openDeleteModalWithConfirm = (version = null) => {
    setDeleteCollection(props.collection);
    setCollectionVersion(version);
    setConfirmDelete(false);
  };

  const closeModal = () => {
    setDeleteCollection(null);
  };

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  const closeAlert = () => {
    setAlerts([]);
  };

  const setArbitraryState = (state) => {
    // there should be either dynamic approach, or big switch
    Object.keys(state).forEach((key) => {
      const value = state[key];
      const methodName = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
      const code = `$methodName($value)`;
      eval(code);
    });
  };

  return (
    <React.Fragment>
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onUploadSuccess={() => {
            setRedirect(
              formatPath(
                Paths.myImports,
                {},
                {
                  namespace: updateCollection.namespace.name,
                },
              ),
            );
          }}
          // onCancel
          setOpen={(isOpen, warn) => toggleImportModal(isOpen, warn)}
          collection={updateCollection}
          namespace={updateCollection.namespace.name}
        />
      )}
      {canSign && (
        <>
          <UploadSingCertificateModal
            isOpen={uploadCertificateModalOpen}
            onCancel={() => closeUploadCertificateModal()}
            onSubmit={(d) => submitCertificate(d)}
          />
          <SignAllCertificatesModal
            name={collectionName}
            isOpen={isOpenSignAllModal}
            onSubmit={signCollection}
            onCancel={() => {
              //this.setState({ isOpenSignAllModal: false });
              setIsOpenSignAllModal(false);
            }}
          />
          <SignSingleCertificateModal
            name={collectionName}
            version={collection.latest_version.version}
            isOpen={isOpenSignModal}
            onSubmit={signVersion}
            onCancel={() => {
              setIsOpenSignModal(false);
            }}
          />
        </>
      )}
      <Modal
        isOpen={isOpenVersionsModal}
        title={t`Collection versions`}
        variant='small'
        onClose={() => {
          setIsOpenVersionsModal(false);
        }}
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
              updateParams={updatePaginationParams}
              count={all_versions.length}
            />
          </div>
          {paginateVersions(all_versions).map((v, i) => (
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
                  //this.setState({ isOpenVersionsModal: false });
                  setIsOpenVersionsModal(false);
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
          updateParams={updatePaginationParams}
          count={all_versions.length}
        />
      </Modal>
      <DeleteCollectionModal
        deleteCollection={deleteCollection}
        isDeletionPending={isDeletionPending}
        confirmDelete={confirmDelete}
        setConfirmDelete={(confirmDelete) => {
          setConfirmDelete(confirmDelete);
        }}
        collectionVersion={collectionVersion}
        cancelAction={() => {
          setDeleteCollection(null);
        }}
        deleteAction={() => {
          setIsDeletionPending(true);

          collectionVersion
            ? deleteCollectionVersion(collectionVersion)
            : DeleteCollectionUtils.deleteCollection({
                collection: deleteCollection,
                setState: (state) => setArbitraryState(state),
                load: null,
                redirect: formatPath(Paths.namespaceByRepo, {
                  repo: context.selectedRepo,
                  namespace: deleteCollection.namespace.name,
                }),
                selectedRepo: context.selectedRepo,
                addAlert: (alert) => context.setAlerts([...alerts, alert]),
              });
        }}
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
            selectedRepo={context.selectedRepo}
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
                onToggle={(isOpenVersionsSelect) => {
                  setIsOpenVersionsSelect(isOpenVersionsSelect);
                }}
                variant={SelectVariant.single}
                onSelect={() => {
                  setIsOpenVersionsSelect(false);
                }}
                selections={`v${collection.latest_version.version}`}
                aria-label={t`Select collection version`}
                loadingVariant={
                  numOfshownVersions < all_versions.length
                    ? {
                        text: t`View more`,
                        onClick: () => {
                          setIsOpenVersionsModal(true);
                          setIsOpenVersionsSelect(false);
                        },
                      }
                    : null
                }
              >
                {renderSelectVersions(all_versions, numOfshownVersions).map(
                  (v) => (
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
                  ),
                )}
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
        <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
        <div className='hub-tab-link-container'>
          <div className='tabs'>{renderTabs(activeTab)}</div>
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
};
