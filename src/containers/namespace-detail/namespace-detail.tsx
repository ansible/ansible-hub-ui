import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './namespace-detail.scss';

import { parsePulpIDFromURL } from 'src/utilities/parse-pulp-id';

import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  DropdownItem,
  Tooltip,
  Text,
  Checkbox,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import ReactMarkdown from 'react-markdown';

import {
  CollectionListType,
  CollectionAPI,
  NamespaceAPI,
  MyNamespaceAPI,
  NamespaceType,
  SignCollectionAPI,
} from 'src/api';

import {
  CollectionFilter,
  CollectionList,
  ImportModal,
  LoadingPageWithHeader,
  Main,
  OwnersTab,
  Pagination,
  PartnerHeader,
  EmptyStateNoData,
  RepoSelector,
  StatefulDropdown,
  ClipboardCopy,
  AlertList,
  closeAlertMixin,
  DeleteModal,
  AlertType,
  SignAllCertificatesModal,
  DeleteCollectionModal,
} from 'src/components';

import {
  ParamHelper,
  getRepoUrl,
  filterIsSet,
  errorMessage,
  waitForTask,
  canSign as canSignNS,
  DeleteCollectionUtils,
} from 'src/utilities';

import { Constants } from 'src/constants';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  canSign: boolean;
  collections: CollectionListType[];
  namespace: NamespaceType;
  params: {
    sort?: string;
    page?: number;
    page_size?: number;
    tab?: string;
    keywords?: string;
    namespace?: string;
    group?: number;
  };
  redirect: string;
  itemCount: number;
  showImportModal: boolean;
  warning: string;
  updateCollection: CollectionListType;
  showControls: boolean;
  isOpenNamespaceModal: boolean;
  isOpenSignModal: boolean;
  isNamespaceEmpty: boolean;
  confirmDelete: boolean;
  isNamespacePending: boolean;
  alerts: AlertType[];
  deleteCollection: CollectionListType;
  isDeletionPending: boolean;
}

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}

export class NamespaceDetail extends React.Component<IProps, IState> {
  nonAPIParams = ['tab', 'group'];

  // namespace is a positional url argument, so don't include it in the
  // query params
  nonQueryStringParams = ['namespace'];

  constructor(props) {
    super(props);
    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    params['namespace'] = props.match.params['namespace'];

    this.state = {
      canSign: false,
      collections: [],
      namespace: null,
      params: params,
      redirect: null,
      itemCount: 0,
      showImportModal: false,
      warning: '',
      updateCollection: null,
      showControls: false, // becomes true when my-namespaces doesn't 404
      isOpenNamespaceModal: false,
      isOpenSignModal: false,
      isNamespaceEmpty: false,
      confirmDelete: false,
      isNamespacePending: false,
      alerts: [],
      deleteCollection: null,
      isDeletionPending: false,
    };
  }

  componentDidMount() {
    this.load();

    this.setState({ alerts: this.context.alerts || [] });
  }

  componentWillUnmount() {
    this.context.setAlerts([]);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const params = ParamHelper.parseParamString(this.props.location.search, [
        'page',
        'page_size',
      ]);

      params['namespace'] = this.props.match.params['namespace'];
      this.setState({ params });
    }
  }

  render() {
    const {
      canSign,
      collections,
      namespace,
      params,
      redirect,
      itemCount,
      showControls,
      showImportModal,
      warning,
      updateCollection,
      isOpenNamespaceModal,
      confirmDelete,
      isNamespacePending,
      alerts,
      deleteCollection,
      isDeletionPending,
    } = this.state;

    if (redirect) {
      return <Redirect push to={redirect} />;
    }

    if (!namespace) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const tabs = [
      { id: 'collections', name: t`Collections` },
      showControls && { id: 'cli-configuration', name: t`CLI configuration` },
      namespace.resources && { id: 'resources', name: t`Resources` },
      { id: 'owners', name: t`Namespace owners` },
    ].filter(Boolean);

    const tab = params['tab'] || 'collections';

    const breadcrumbs = [
      namespaceBreadcrumb,
      {
        name: namespace.name,
        url:
          tab === 'owners'
            ? formatPath(Paths.namespaceByRepo, {
                repo: this.context.selectedRepo,
                namespace: namespace.name,
              })
            : null,
      },
      tab === 'owners'
        ? {
            name: t`Namespace owners`,
            url: params.group
              ? formatPath(
                  Paths.namespaceByRepo,
                  {
                    repo: this.context.selectedRepo,
                    namespace: namespace.name,
                  },
                  { tab: 'owners' },
                )
              : null,
          }
        : null,
      tab === 'owners' && params.group
        ? { name: t`Group ${params.group}` }
        : null,
    ].filter(Boolean);

    const repositoryUrl = getRepoUrl('inbound-' + namespace.name);

    const noData = itemCount === 0 && !filterIsSet(params, ['keywords']);

    const updateParams = (params) =>
      this.updateParams(params, () => this.loadCollections());

    const ignoredParams = [
      'namespace',
      'page',
      'page_size',
      'sort',
      'tab',
      'group',
      'view_type',
    ];

    const { hasPermission } = this.context;

    const canEditOwners =
      this.state.namespace.related_fields.my_permissions?.includes(
        'galaxy.change_namespace',
      ) || hasPermission('galaxy.change_namespace');

    // remove ?group (owners tab) when switching tabs
    const tabParams = { ...params };
    delete tabParams.group;

    return (
      <React.Fragment>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <ImportModal
          isOpen={showImportModal}
          onUploadSuccess={() =>
            this.setState({
              redirect: formatPath(
                Paths.myImports,
                {},
                {
                  namespace: namespace.name,
                },
              ),
            })
          }
          // onCancel
          setOpen={(isOpen, warn) => this.toggleImportModal(isOpen, warn)}
          collection={updateCollection}
          namespace={namespace.name}
        />
        <DeleteCollectionModal
          deleteCollection={deleteCollection}
          isDeletionPending={isDeletionPending}
          confirmDelete={confirmDelete}
          setConfirmDelete={(confirmDelete) => this.setState({ confirmDelete })}
          cancelAction={() => this.setState({ deleteCollection: null })}
          deleteAction={() =>
            this.setState({ isDeletionPending: true }, () =>
              DeleteCollectionUtils.deleteCollection({
                collection: deleteCollection,
                setState: (state) => this.setState(state),
                load: () => this.load(),
                redirect: false,
                selectedRepo: this.context.selectedRepo,
                addAlert: (alert) => this.addAlert(alert),
              }),
            )
          }
        />
        {isOpenNamespaceModal && (
          <DeleteModal
            spinner={isNamespacePending}
            cancelAction={this.closeModal}
            deleteAction={this.deleteNamespace}
            title={t`Delete namespace?`}
            isDisabled={!confirmDelete || isNamespacePending}
          >
            <>
              <Text className='delete-namespace-modal-message'>
                <Trans>
                  Deleting <b>{namespace.name}</b> and its data will be lost.
                </Trans>
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
        {warning ? (
          <Alert
            className='hub-c-alert-namespace'
            variant='warning'
            title={warning}
            actionClose={
              <AlertActionCloseButton
                onClose={() => this.setState({ warning: '' })}
              />
            }
          ></Alert>
        ) : null}
        <PartnerHeader
          namespace={namespace}
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          params={tabParams}
          updateParams={(p) => this.updateParams(p)}
          pageControls={this.renderPageControls()}
          contextSelector={
            <RepoSelector
              selectedRepo={this.context.selectedRepo}
              path={this.props.match.path as Paths} // Paths.namespaceByRepo or Paths.myCollectionsByRepo
              pathParams={{ namespace: namespace.name }}
            />
          }
          filters={
            tab === 'collections' ? (
              <div className='hub-toolbar-wrapper namespace-detail'>
                <div className='toolbar'>
                  <CollectionFilter
                    ignoredParams={ignoredParams}
                    params={params}
                    updateParams={updateParams}
                  />

                  <div className='hub-pagination-container'>
                    <Pagination
                      params={params}
                      updateParams={updateParams}
                      count={itemCount}
                      isTop
                    />
                  </div>
                </div>
              </div>
            ) : null
          }
        ></PartnerHeader>
        <Main>
          {tab === 'collections' ? (
            noData ? (
              <EmptyStateNoData
                title={t`No collections yet`}
                description={t`Collections will appear once uploaded`}
                button={
                  this.state.showControls && (
                    <Button
                      onClick={() => this.setState({ showImportModal: true })}
                    >
                      {t`Upload collection`}
                    </Button>
                  )
                }
              />
            ) : (
              <section className='body'>
                <CollectionList
                  updateParams={updateParams}
                  params={params}
                  ignoredParams={ignoredParams}
                  collections={collections}
                  itemCount={itemCount}
                  showControls={this.state.showControls}
                  repo={this.context.selectedRepo}
                  renderCollectionControls={(collection) =>
                    this.renderCollectionControls(collection)
                  }
                />
              </section>
            )
          ) : null}
          {tab === 'cli-configuration' ? (
            <section className='body'>
              <div>
                <div>
                  <Trans>
                    <b>Note:</b> Use this URL to configure ansible-galaxy to
                    upload collections to this namespace. More information on
                    ansible-galaxy configurations can be found{' '}
                    <a
                      href='https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client'
                      target='_blank'
                      rel='noreferrer'
                    >
                      here
                    </a>
                    <span>&nbsp;</span>
                    <ExternalLinkAltIcon />.
                  </Trans>
                </div>
                <ClipboardCopy isReadOnly>{repositoryUrl}</ClipboardCopy>
              </div>
            </section>
          ) : null}
          {tab === 'resources' ? this.renderResources(namespace) : null}
          {tab === 'owners' ? (
            <OwnersTab
              addAlert={(alert: AlertType) =>
                this.setState({
                  alerts: [...this.state.alerts, alert],
                })
              }
              canEditOwners={canEditOwners}
              groupId={params.group}
              groups={namespace.groups}
              name={namespace.name}
              pulpObjectType='pulp_ansible/namespaces'
              reload={() => this.load()}
              selectRolesMessage={t`The selected roles will be added to this specific namespace.`}
              updateGroups={(groups) =>
                MyNamespaceAPI.update(namespace.name, {
                  ...namespace,
                  groups,
                })
              }
              urlPrefix={formatPath(Paths.namespaceByRepo, {
                repo: this.context.selectedRepo,
                namespace: namespace.name,
              })}
            />
          ) : null}
        </Main>
        {canSign && (
          <SignAllCertificatesModal
            name={this.state.namespace.name}
            isOpen={this.state.isOpenSignModal}
            onSubmit={() => {
              this.signAllCertificates(namespace);
            }}
            onCancel={() => {
              this.setState({ isOpenSignModal: false });
            }}
          />
        )}
      </React.Fragment>
    );
  }

  private handleCollectionAction(id, action) {
    const collection = this.state.collections.find((x) => x.id === id);

    switch (action) {
      case 'upload':
        this.setState({
          updateCollection: collection,
          showImportModal: true,
        });
        break;
      case 'deprecate':
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'info',
              title: t`Deprecation status update starting for collection "${collection.name}".`,
            },
          ],
        });
        CollectionAPI.setDeprecation(
          collection,
          !collection.deprecated,
          this.context.selectedRepo,
        )
          .then((result) => {
            const taskId = parsePulpIDFromURL(result.data.task);
            return waitForTask(taskId).then(() => {
              const title = collection.deprecated
                ? t`Collection "${collection.name}" has been successfully undeprecated.`
                : t`Collection "${collection.name}" has been successfully deprecated.`;
              this.setState({
                alerts: [
                  ...this.state.alerts,
                  {
                    title: title,
                    variant: 'success',
                  },
                ],
              });
              return this.loadCollections();
            });
          })
          .catch(() => {
            this.setState({
              warning: t`API Error: Failed to set deprecation.`,
            });
          });
        break;
    }
  }

  private renderResources(namespace: NamespaceType) {
    return (
      <div className='pf-c-content preview'>
        <ReactMarkdown>{namespace.resources}</ReactMarkdown>
      </div>
    );
  }

  private signAllCertificates(namespace: NamespaceType) {
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign all collections.`,
      description: t`API Error: ${status}`,
    });

    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          id: 'loading-signing',
          variant: 'success',
          title: t`Signing started for all collections in namespace "${namespace.name}".`,
        },
      ],
      isOpenSignModal: false,
    });

    SignCollectionAPI.sign({
      signing_service: this.context.settings.GALAXY_COLLECTION_SIGNING_SERVICE,
      distro_base_path: this.context.selectedRepo,
      namespace: namespace.name,
    })
      .then((result) => {
        waitForTask(result.data.task_id)
          .then(() => {
            this.load();
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
  }

  private loadCollections() {
    CollectionAPI.list(
      {
        ...ParamHelper.getReduced(this.state.params, this.nonAPIParams),
      },
      this.context.selectedRepo,
    ).then((result) => {
      this.setState({
        collections: result.data.data,
        itemCount: result.data.meta.count,
      });
    });
  }

  private load() {
    Promise.all([
      CollectionAPI.list(
        {
          ...ParamHelper.getReduced(this.state.params, this.nonAPIParams),
        },
        this.context.selectedRepo,
      ),
      NamespaceAPI.get(this.props.match.params['namespace'], {
        include_related: 'my_permissions',
      }),
      MyNamespaceAPI.get(this.props.match.params['namespace'], {
        include_related: 'my_permissions',
      }).catch((e) => {
        // TODO this needs fixing on backend to return nothing in these cases with 200 status
        // if view only mode is enabled disregard errors and hope
        if (
          this.context.user.is_anonymous &&
          this.context.settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS
        ) {
          return null;
        }
        // expecting 404 - it just means we can not edit the namespace (unless both NamespaceAPI and MyNamespaceAPI fail)
        return e.response && e.response.status === 404
          ? null
          : Promise.reject(e);
      }),
    ])
      .then((val) => {
        this.setState({
          collections: val[0].data.data,
          itemCount: val[0].data.meta.count,
          namespace: val[1].data,
          showControls: !!val[2],
          canSign: canSignNS(this.context, val[2]?.data),
        });

        this.loadAllRepos(val[0].data.meta.count);
      })
      .catch(() => {
        this.setState({ redirect: Paths.notFound });
      });
  }

  private loadAllRepos(currentRepoCount) {
    // get collections in namespace from each repo
    // except the one we already have
    const repoPromises = Object.keys(Constants.REPOSITORYNAMES)
      .filter((repo) => repo !== this.context.selectedRepo)
      .map((repo) =>
        CollectionAPI.list(
          { namespace: this.props.match.params['namespace'] },
          repo,
        ),
      );

    Promise.all(repoPromises)
      .then((results) =>
        this.setState({
          isNamespaceEmpty:
            results.every((val) => val.data.meta.count === 0) &&
            currentRepoCount === 0,
        }),
      )
      .catch((err) => {
        const { status, statusText } = err.response;
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Collection repositories could not be displayed.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }

  private renderPageControls() {
    const { canSign, collections } = this.state;
    const { can_upload_signatures } = this.context?.featureFlags || {};
    const { hasPermission } = this.context;

    const dropdownItems = [
      <DropdownItem
        key='1'
        component={
          <Link
            to={formatPath(Paths.editNamespace, {
              namespace: this.state.namespace.name,
            })}
          >
            {t`Edit namespace`}
          </Link>
        }
      />,
      hasPermission('galaxy.delete_namespace') && (
        <React.Fragment key={'2'}>
          {this.state.isNamespaceEmpty ? (
            <DropdownItem
              onClick={() => this.setState({ isOpenNamespaceModal: true })}
            >
              {t`Delete namespace`}
            </DropdownItem>
          ) : (
            <Tooltip
              isVisible={false}
              content={
                <Trans>
                  Cannot delete namespace until <br />
                  collections&apos; dependencies have <br />
                  been deleted
                </Trans>
              }
              position='left'
            >
              <DropdownItem isDisabled>{t`Delete namespace`}</DropdownItem>
            </Tooltip>
          )}
        </React.Fragment>
      ),
      <DropdownItem
        key='3'
        component={
          <Link
            to={formatPath(
              Paths.myImports,
              {},
              {
                namespace: this.state.namespace.name,
              },
            )}
          >
            {t`Imports`}
          </Link>
        }
      />,
      canSign && !can_upload_signatures && (
        <DropdownItem
          key='sign-collections'
          data-cy='sign-all-collections-button'
          onClick={() => this.setState({ isOpenSignModal: true })}
        >
          {t`Sign all collections`}
        </DropdownItem>
      ),
    ].filter(Boolean);
    if (!this.state.showControls) {
      return <div className='hub-namespace-page-controls'></div>;
    }
    return (
      <div className='hub-namespace-page-controls' data-cy='kebab-toggle'>
        {' '}
        {collections.length !== 0 && (
          <Button onClick={() => this.setState({ showImportModal: true })}>
            {t`Upload collection`}
          </Button>
        )}
        {dropdownItems.length > 0 && (
          <div data-cy='ns-kebab-toggle'>
            <StatefulDropdown items={dropdownItems} />
          </div>
        )}
      </div>
    );
  }

  private toggleImportModal(isOpen: boolean, warning?: string) {
    const newState = { showImportModal: isOpen };
    if (warning) {
      newState['warning'] = warning;
    }

    if (!isOpen) {
      newState['updateCollection'] = null;
    }

    this.setState(newState);
  }

  private deleteNamespace = () => {
    const {
      namespace: { name },
    } = this.state;
    this.setState({ isNamespacePending: true }, () =>
      NamespaceAPI.delete(name)
        .then(() => {
          this.setState({
            redirect: formatPath(namespaceBreadcrumb.url, {}),
            confirmDelete: false,
            isNamespacePending: false,
          });
          this.context.setAlerts([
            ...this.context.alerts,
            {
              variant: 'success',
              title: (
                <Trans>
                  Namespace &quot;{name}&quot; has been successfully deleted.
                </Trans>
              ),
            },
          ]);
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState(
            {
              isOpenNamespaceModal: false,
              confirmDelete: false,
              isNamespacePending: false,
            },
            () => {
              this.setState({
                alerts: [
                  ...this.state.alerts,
                  {
                    variant: 'danger',
                    title: t`Namespace "${name}" could not be deleted.`,
                    description: errorMessage(status, statusText),
                  },
                ],
              });
            },
          );
        }),
    );
  };

  private closeModal = () => {
    this.setState({ isOpenNamespaceModal: false, confirmDelete: false });
  };

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private renderCollectionControls(collection: CollectionListType) {
    const { hasPermission } = this.context;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={() => this.handleCollectionAction(collection.id, 'upload')}
          variant='secondary'
        >
          {t`Upload new version`}
        </Button>
        <StatefulDropdown
          items={[
            DeleteCollectionUtils.deleteMenuOption({
              canDeleteCollection: hasPermission('ansible.delete_collection'),
              noDependencies: null,
              onClick: () =>
                DeleteCollectionUtils.tryOpenDeleteModalWithConfirm({
                  addAlert: (alert) => this.addAlert(alert),
                  setState: (state) => this.setState(state),
                  collection,
                }),
            }),
            <DropdownItem
              onClick={() =>
                this.handleCollectionAction(collection.id, 'deprecate')
              }
              key='deprecate'
            >
              {collection.deprecated ? t`Undeprecate` : t`Deprecate`}
            </DropdownItem>,
          ].filter(Boolean)}
          ariaLabel='collection-kebab'
        />
      </div>
    );
  }
}

NamespaceDetail.contextType = AppContext;

export default withRouter(NamespaceDetail);
