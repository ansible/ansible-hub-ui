import { Trans, t } from '@lingui/macro';
import {
  Button,
  Flex,
  FlexItem,
  List,
  ListItem,
  Modal,
  Text,
} from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import React, { Fragment, useEffect, useState } from 'react';
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
  SignCollectionAPI,
} from 'src/api';
import {
  Alert,
  AlertList,
  type AlertType,
  BaseHeader,
  type BreadcrumbType,
  Breadcrumbs,
  CollectionDropdown,
  CollectionRatings,
  CopyCollectionToRepositoryModal,
  DateComponent,
  DeleteCollectionModal,
  DownloadCount,
  ExternalLink,
  HubPagination,
  ImportModal,
  LinkTabs,
  Logo,
  RepositoryBadge,
  SignAllCertificatesModal,
  SignSingleCertificateModal,
  SignatureBadge,
  Spinner,
  UploadSignatureModal,
  closeAlert,
} from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  DeleteCollectionUtils,
  ParamHelper,
  canSignNamespace,
  jsxErrorMessage,
  namespaceTitle,
  parsePulpIDFromURL,
  repositoryRemoveCollection,
  waitForTask,
} from 'src/utilities';

interface IProps {
  activeTab: string;
  actuallyCollection: CollectionDetailType;
  breadcrumbs: BreadcrumbType[];
  collection: CollectionVersionSearch;
  collections: CollectionVersionSearch[];
  collectionsCount: number;
  content: CollectionVersionContentType;
  params: {
    latestVersion?: string;
    version?: string;
  };
  reload: () => void;
  updateParams: (params) => void;
}

export const CollectionHeader = ({
  activeTab,
  actuallyCollection,
  breadcrumbs,
  collection,
  collections,
  collectionsCount,
  content,
  params,
  reload,
  updateParams,
}: IProps) => {
  const [alerts, setAlerts] = useState([]);
  const [collectionVersion, setCollectionVersion] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copyCollectionToRepositoryModal, setCopyCollectionToRepositoryModal] =
    useState(null);
  const [deleteAll, setDeleteAll] = useState(false);
  const [deleteCollection, setDeleteCollection] = useState(null);
  const [deletionBlocked, setDeletionBlocked] = useState(true);
  const [isDeletionPending, setIsDeletionPending] = useState(false);
  const [isOpenSignAllModal, setIsOpenSignAllModal] = useState(false);
  const [isOpenSignModal, setIsOpenSignModal] = useState(false);
  const [isOpenVersionsModal, setIsOpenVersionsModal] = useState(false);
  const [isOpenVersionsSelect, setIsOpenVersionsSelect] = useState(false);
  const [modalCollections, setModalCollections] = useState(null);
  const [modalPagination, setModalPagination] = useState({
    page: 1,
    page_size: 10,
  });
  const [namespace, setNamespace] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [updateCollection, setUpdateCollection] = useState(null);
  const [uploadCertificateModalOpen, setUploadCertificateModalOpen] =
    useState(false);
  const [versionToUploadCertificate, setVersionToUploadCertificate] =
    useState(undefined);

  useEffect(() => {
    DeleteCollectionUtils.countUsedbyDependencies(collection)
      .then((count) => setDeletionBlocked(!!count))
      .catch((alert) => addAlert(alert));

    NamespaceAPI.get(collection.collection_version.namespace, {
      include_related: 'my_permissions',
    }).then(({ data }) => {
      setNamespace(data);
    });

    setModalCollections(collections);
  }, []);

  useEffect(() => {
    setModalCollections(collections);
  }, [collections]);

  const context = useHubContext();
  const {
    featureFlags: { can_upload_signatures, display_signatures },
    queueAlert,
    settings: { GALAXY_COLLECTION_SIGNING_SERVICE },
  } = context;

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
      .map((b, i) => (i ? <Fragment key={i}> {b}</Fragment> : b)); // join with spaces

  const nsTitle = namespaceTitle(
    namespace_metadata || { name: collection_version.namespace },
  );

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  const canSign = canSignNamespace(context, namespace);

  const issueUrl =
    'https://access.redhat.com/support/cases/#/case/new/open-case/describe-issue/recommendations?caseCreate=true&product=Ansible%20Automation%20Hub&version=Online&summary=' +
    encodeURIComponent(
      `${collection_version.namespace}-${collectionName}-${version}`,
    );

  const deleteFromRepo = deleteAll ? null : collection.repository.name;

  const deleteFn = (deleteAll) => ({
    openModal: () => openDeleteModalWithConfirm(null, deleteAll),
    skipCheck: true, // already handled by deletionBlocked
  });

  return (
    <>
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onUploadSuccess={() =>
            setRedirect(
              formatPath(
                Paths.myImports,
                {},
                { namespace: updateCollection.collection_version.namespace },
              ),
            )
          }
          // onCancel
          setOpen={(isOpen, warn) => toggleImportModal(isOpen, warn)}
          collection={updateCollection.collection_version}
          namespace={updateCollection.collection_version.namespace}
        />
      )}
      {canSign && (
        <>
          <UploadSignatureModal
            isOpen={uploadCertificateModalOpen}
            onCancel={() => closeUploadCertificateModal()}
            onSubmit={(d) => submitCertificate(d)}
          />
          <SignAllCertificatesModal
            name={collectionName}
            isOpen={isOpenSignAllModal}
            onSubmit={signCollection}
            onCancel={() => {
              setIsOpenSignAllModal(false);
            }}
          />
          <SignSingleCertificateModal
            name={collectionName}
            version={version}
            isOpen={isOpenSignModal}
            onSubmit={signVersion}
            onCancel={() => setIsOpenSignModal(false)}
          />
        </>
      )}
      <Modal
        isOpen={isOpenVersionsModal}
        title={t`Collection versions`}
        variant='small'
        onClose={() => setIsOpenVersionsModal(false)}
      >
        <List isPlain>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 'var(--pf-v5-global--spacer--md)',
            }}
          >
            <Text>{t`${collectionName}'s versions.`}</Text>
            <HubPagination
              isTop
              params={modalPagination}
              updateParams={updatePaginationParams}
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
                    setIsOpenVersionsModal(false);
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
        <HubPagination
          params={modalPagination}
          updateParams={updatePaginationParams}
          count={collectionsCount}
        />
      </Modal>
      <DeleteCollectionModal
        deleteCollection={deleteCollection}
        collections={collections}
        isDeletionPending={isDeletionPending}
        confirmDelete={confirmDelete}
        setConfirmDelete={(confirmDelete) => setConfirmDelete(confirmDelete)}
        collectionVersion={version}
        cancelAction={() => setDeleteCollection(null)}
        deleteAction={() => {
          setIsDeletionPending(true);
          if (collectionVersion) {
            deleteCollectionVersion(collectionVersion);
          } else {
            DeleteCollectionUtils.deleteCollection({
              collection: deleteCollection,
              setState: ({ redirect, deleteCollection, isDeletionPending }) => {
                if (redirect) {
                  setRedirect(redirect);
                }
                if (deleteCollection === null && isDeletionPending === false) {
                  setDeleteCollection(null);
                  setIsDeletionPending(false);
                }
              },
              load: null,
              redirect: formatPath(Paths.namespaceDetail, {
                namespace: deleteCollection.collection_version.namespace,
              }),
              addAlert: (alert) => queueAlert(alert),
              deleteFromRepo,
            });
          }
        }}
        deleteFromRepo={deleteFromRepo}
      />
      {copyCollectionToRepositoryModal && (
        <CopyCollectionToRepositoryModal
          addAlert={(alert) => addAlert(alert)}
          closeAction={() => setCopyCollectionToRepositoryModal(null)}
          collectionVersion={collection}
        />
      )}
      <BaseHeader
        title={`${collection_version.namespace}.${collection_version.name}`}
        logo={
          namespace_metadata?.avatar_url && (
            <Logo
              alt={t`${nsTitle} logo`}
              className='hub-header-image'
              fallbackToDefault
              image={namespace_metadata.avatar_url}
              size='40px'
              unlockWidth
            />
          )
        }
        contextSelector={
          <RepositoryBadge
            isBreadcrumbContainer
            name={collection.repository.name}
          />
        }
        breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
        versionControl={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.5rem',
              }}
            >
              <span>{t`Version`}</span>
              <div style={{ width: '300px' }}>
                <Select
                  isOpen={isOpenVersionsSelect}
                  onToggle={(_event, isOpenVersionsSelect) =>
                    setIsOpenVersionsSelect(isOpenVersionsSelect)
                  }
                  variant={SelectVariant.single}
                  onSelect={() => setIsOpenVersionsSelect(false)}
                  selections={`v${version}`}
                  aria-label={t`Select collection version`}
                  loadingVariant={
                    collections.length < collectionsCount
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
                <span style={{ color: 'grey' }}>
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
            {IS_INSIGHTS ? (
              <FlexItem>
                <ExternalLink href={issueUrl}>{t`Create issue`}</ExternalLink>
              </FlexItem>
            ) : null}
            <CollectionDropdown
              collection={collection}
              data-cy='kebab-toggle'
              deletionBlocked={deletionBlocked}
              namespace={namespace}
              onCopyVersion={() => copyToRepository(collection)}
              onDelete={deleteFn(true)}
              onDeleteVersion={() => openDeleteModalWithConfirm(version, true)}
              onDeprecate={() => deprecate(collection)}
              onRemove={deleteFn(false)}
              onRemoveVersion={() => openDeleteModalWithConfirm(version, false)}
              onSign={() => setIsOpenSignAllModal(true)}
              onSignVersion={() => {
                if (can_upload_signatures) {
                  setUploadCertificateModalOpen(true);
                  setVersionToUploadCertificate(collection);
                } else {
                  setIsOpenSignModal(true);
                }
              }}
              onUploadVersion={() => checkUploadPrivilleges(collection)}
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
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts,
            })
          }
        />
        <div className='hub-tab-link-container'>
          <div className='tabs'>{renderTabs(activeTab)}</div>
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

  function checkUploadPrivilleges(collection) {
    const permissionAlert = () => {
      addAlert({
        title: t`You don't have rights to do this operation.`,
        variant: 'warning',
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
          setUpdateCollection(collection);
          setShowImportModal(true);
        } else {
          permissionAlert();
        }
      })
      .catch(() => permissionAlert());
  }

  function renderTabs(active) {
    const pathParams = {
      namespace: collection.collection_version.namespace,
      collection: collection.collection_version.name,
      repo: collection.repository.name,
    };
    const reduced = ParamHelper.getReduced(params, ['showing', 'keywords']);

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

  async function submitCertificate(file: File) {
    const { collection_version: version, repository } =
      versionToUploadCertificate;

    const signed_collection = collection.collection_version.pulp_href;

    addAlert({
      id: 'upload-certificate',
      variant: 'info',
      title: t`The certificate for "${version.namespace} ${version.name} v${version.version}" is being uploaded.`,
    });

    closeUploadCertificateModal();

    CertificateUploadAPI.upload({
      file,
      repository: repository.pulp_href,
      signed_collection,
    })
      .then((result) => {
        return waitForTask(parsePulpIDFromURL(result.data.task)).then(() => {
          if (reload) {
            reload();
          }
          setAlerts((alerts) =>
            alerts.filter(({ id }) => id !== 'upload-certificate'),
          );
          addAlert({
            variant: 'success',
            title: t`Certificate for collection "${version.namespace} ${version.name} v${version.version}" has been successfully uploaded.`,
          });
        });
      })
      .catch((error) => {
        setAlerts((alerts) =>
          alerts.filter(({ id }) => id !== 'upload-certificate'),
        );
        addAlert({
          variant: 'danger',
          title: t`The certificate for "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
          description: error,
        });
      });
  }

  function closeUploadCertificateModal() {
    setUploadCertificateModalOpen(false);
    setVersionToUploadCertificate(undefined);
  }

  function updatePaginationParams({ page, page_size }) {
    const modalPagination = {
      page,
      page_size,
    };

    setModalPagination(modalPagination);
    setModalCollections(null);

    const { namespace, name } = collection.collection_version;
    const repository = collection.repository;
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
        setModalCollections(modalCollections),
      );
  }

  function signCollection() {
    const { namespace, name } = collection.collection_version;
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign all versions in the collection.`,
      description: t`API Error: ${status}`,
    });

    addAlert({
      id: 'loading-signing',
      variant: 'success',
      title: t`Signing started for all versions in collection "${name}"`,
    });
    setIsOpenSignAllModal(false);

    SignCollectionAPI.sign({
      signing_service: GALAXY_COLLECTION_SIGNING_SERVICE,
      repository: collection.repository,
      namespace,
      collection: name,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => updateParams({}))
          .catch((error) => addAlert(errorAlert(error)))
          .finally(() =>
            setAlerts((alerts) =>
              alerts.filter(({ id }) => id !== 'loading-signing'),
            ),
          );
      })
      .catch((error) =>
        // The request failed in the first place
        addAlert(errorAlert(error.response.status)),
      );
  }

  function signVersion() {
    const { name, version, namespace } = collection.collection_version;

    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign the version.`,
      description: t`API Error: ${status}`,
    });

    addAlert({
      id: 'loading-signing',
      variant: 'success',
      title: t`Signing started for collection "${name} v${version}".`,
    });

    setIsOpenSignModal(false);

    SignCollectionAPI.sign({
      signing_service: GALAXY_COLLECTION_SIGNING_SERVICE,
      repository: collection.repository,
      namespace,
      collection: name,
      version,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => updateParams({}))
          .catch((error) => addAlert(errorAlert(error)))
          .finally(() =>
            setAlerts((alerts) =>
              alerts.filter(({ id }) => id !== 'loading-signing'),
            ),
          );
      })
      .catch((error) =>
        // The request failed in the first place
        addAlert(errorAlert(error.response.status)),
      );
  }

  function deprecate(collection) {
    CollectionAPI.setDeprecation(collection)
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        return waitForTask(taskId).then(() => {
          const title = !collection.is_deprecated
            ? t`The collection "${collection.collection_version.name}" has been successfully deprecated.`
            : t`The collection "${collection.collection_version.name}" has been successfully undeprecated.`;
          addAlert({
            title,
            variant: 'success',
          });
          if (reload) {
            reload();
          }
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        setCollectionVersion(null);
        addAlert({
          variant: 'danger',
          title: !collection.is_deprecated
            ? t`Collection "${collection.collection_version.name}" could not be deprecated.`
            : t`Collection "${collection.collection_version.name}" could not be undeprecated.`,
          description: jsxErrorMessage(status, statusText),
        });
      });
  }

  function deleteCollectionVersion(collectionVersion) {
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
          updateParams(
            ParamHelper.setParam(
              params,
              'version',
              topVersion[0].collection_version.version,
            ),
          );

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
          queueAlert({
            variant: 'success',
            title: (
              <Trans>
                Collection &quot;{name} v{collectionVersion}&quot; has been
                successfully deleted.
              </Trans>
            ),
          });
          setRedirect(
            formatPath(Paths.namespaceDetail, {
              namespace: deleteCollection.collection_version.namespace,
            }),
          );
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
              <List
                style={{
                  marginTop: 'var(--pf-v5-global--spacer--sm)',
                }}
              >
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
            title: t`Collection "${deleteCollection.collection_version.name} v${collectionVersion}" could not be deleted.`,
            description: jsxErrorMessage(status, statusText),
          });
        }
      });
  }

  function toggleImportModal(isOpen: boolean, warning?: string) {
    if (warning) {
      addAlert({
        title: warning,
        variant: 'warning',
      });
    }

    setShowImportModal(isOpen);
  }

  function openDeleteModalWithConfirm(version = null, deleteAll = true) {
    setDeleteCollection(collection);
    setCollectionVersion(version);
    setConfirmDelete(false);
    setDeleteAll(deleteAll);
  }

  function copyToRepository(collection: CollectionVersionSearch) {
    setCopyCollectionToRepositoryModal(collection);
  }

  function addAlert(alert: AlertType) {
    setAlerts((alerts) => [...alerts, alert]);
  }
};
