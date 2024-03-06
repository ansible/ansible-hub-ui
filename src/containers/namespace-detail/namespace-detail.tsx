import { Trans, t } from '@lingui/macro';
import { Button, Checkbox, Text } from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, Navigate } from 'react-router-dom';
import {
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
  GroupType,
  MyNamespaceAPI,
  NamespaceAPI,
  NamespaceType,
  RoleType,
  SignCollectionAPI,
} from 'src/api';
import {
  AccessTab,
  AlertList,
  AlertType,
  CollectionDropdown,
  CollectionList,
  CopyURL,
  DeleteCollectionModal,
  DeleteModal,
  EmptyStateNoData,
  ExternalLink,
  HubListToolbar,
  ImportModal,
  LoadingPageWithHeader,
  Main,
  PartnerHeader,
  SignAllCertificatesModal,
  StatefulDropdown,
  WisdomModal,
  closeAlert,
  collectionFilter,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import {
  DeleteCollectionUtils,
  ParamHelper,
  RouteProps,
  canSignNamespace,
  errorMessage,
  filterIsSet,
  getRepoURL,
  parsePulpIDFromURL,
  waitForTask,
  withRouter,
} from 'src/utilities';

interface UserType {
  username: string;
  object_roles: string[];
}

interface IState {
  alerts: AlertType[];
  canSign: boolean;
  collections: CollectionVersionSearch[];
  confirmDelete: boolean;
  deleteAll: boolean;
  deleteCollection: CollectionVersionSearch;
  filteredCount: number;
  group: GroupType;
  isDeletionPending: boolean;
  isNamespacePending: boolean;
  isOpenNamespaceModal: boolean;
  isOpenSignModal: boolean;
  isOpenWisdomModal: boolean;
  namespace: NamespaceType;
  params: {
    group?: string;
    keywords?: string;
    namespace?: string;
    page?: number;
    page_size?: number;
    repository_name?: string;
    sort?: string;
    tab?: string;
    user?: string;
  };
  redirect: string;
  showControls: boolean;
  showGroupRemoveModal?: GroupType;
  showGroupSelectWizard?: { group?: GroupType; roles?: RoleType[] };
  showImportModal: boolean;
  showRoleRemoveModal?: string;
  showRoleSelectWizard?: { roles?: RoleType[] };
  showUserRemoveModal?: UserType;
  showUserSelectWizard?: { user?: UserType; roles?: RoleType[] };
  unfilteredCount: number;
  updateCollection: CollectionVersionSearch;
  user: UserType;
}

export class NamespaceDetail extends Component<RouteProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]) as IState['params'];

    params.namespace = props.routeParams.namespace;
    if (props.routeParams.repo && !params.repository_name) {
      params.repository_name = props.routeParams.repo;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      alerts: [],
      canSign: false,
      collections: [],
      confirmDelete: false,
      deleteAll: true,
      deleteCollection: null,
      filteredCount: 0,
      group: null,
      isDeletionPending: false,
      isNamespacePending: false,
      isOpenNamespaceModal: false,
      isOpenSignModal: false,
      isOpenWisdomModal: false,
      namespace: null,
      params,
      redirect: null,
      showControls: false, // becomes true when my-namespaces doesn't 404
      showGroupRemoveModal: null,
      showGroupSelectWizard: null,
      showImportModal: false,
      showRoleRemoveModal: null,
      showRoleSelectWizard: null,
      unfilteredCount: 0,
      updateCollection: null,
      user: null,
    };
  }

  componentDidMount() {
    this.load();

    this.setState({ alerts: (this.context as IAppContextType).alerts || [] });
    (this.context as IAppContextType).setAlerts([]);
  }

  componentDidUpdate(prevProps) {
    const params = ParamHelper.parseParamString(this.props.location.search, [
      'page',
      'page_size',
    ]) as IState['params'];

    if (prevProps.location.search !== this.props.location.search) {
      params.namespace = this.props.routeParams.namespace;

      this.setState({
        params,
        group: this.filterGroup(params.group, this.state.namespace.groups),
        user: this.filterUser(params.user, this.state.namespace.users),
      });
    }

    if (
      prevProps.routeParams.repo !== this.props.routeParams.repo &&
      this.props.routeParams.repo &&
      (!params.repository_name ||
        params.repository_name === prevProps.routeParams.repo)
    ) {
      params.repository_name = this.props.routeParams.repo;
      this.setState({ params });
    }
  }

  filterUser(username, users) {
    return username
      ? users.find((u) => u.name === username || u.username === username)
      : null;
  }

  filterGroup(name, groups) {
    return name ? groups.find((g) => g.name === name) : null;
  }

  private updateRoles({
    users = null,
    groups = null,
    alertSuccess,
    alertFailure,
    stateUpdate,
  }) {
    const { name } = this.state.namespace;
    MyNamespaceAPI.update(name, {
      ...this.state.namespace,
      users: users || this.state.namespace.users,
      groups: groups || this.state.namespace.groups,
    })
      .then(() => {
        this.addAlert({
          title: alertSuccess,
          variant: 'success',
        });
        this.load(); // ensure reload() sets users/groups: null to trigger loading spinner
      })
      .catch(({ response: { status, statusText } }) => {
        this.addAlert({
          title: alertFailure,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      })
      .finally(() => {
        this.setState(stateUpdate);
      });
  }

  hasPerm(permission) {
    const { namespace } = this.state;
    const {
      hasPermission,
      user: { is_superuser },
    } = this.context as IAppContextType;

    const hasObjectPermission = (permission) =>
      namespace?.related_fields?.my_permissions?.includes?.(permission);

    return (
      hasPermission(permission) ||
      hasObjectPermission(permission) ||
      is_superuser
    );
  }

  render() {
    const {
      alerts,
      canSign,
      collections,
      confirmDelete,
      deleteCollection,
      filteredCount,
      isDeletionPending,
      isNamespacePending,
      isOpenNamespaceModal,
      isOpenWisdomModal,
      namespace,
      params,
      redirect,
      showControls,
      showImportModal,
      updateCollection,
    } = this.state;
    const { featureFlags } = this.context as IAppContextType;
    const { legacy_roles, display_signatures } = featureFlags;

    if (redirect) {
      return <Navigate to={redirect} />;
    }

    if (!namespace) {
      return <LoadingPageWithHeader />;
    }

    const tab = params.tab || 'collections';
    const { user, group } = params;

    const tabs = [
      {
        active: tab === 'collections',
        title: t`Collections`,
        link: formatPath(
          Paths.namespaceDetail,
          { namespace: namespace.name },
          { tab: 'collections' },
        ),
      },
      showControls && {
        active: tab === 'cli-configuration',
        title: t`CLI configuration`,
        link: formatPath(
          Paths.namespaceDetail,
          { namespace: namespace.name },
          { tab: 'cli-configuration' },
        ),
      },
      namespace.resources && {
        active: tab === 'resources',
        title: t`Resources`,
        link: formatPath(
          Paths.namespaceDetail,
          { namespace: namespace.name },
          { tab: 'resources' },
        ),
      },
      {
        active: tab === 'access',
        title: t`Access`,
        link: formatPath(
          Paths.namespaceDetail,
          { namespace: namespace.name },
          { tab: 'access' },
        ),
      },
      legacy_roles && {
        active: tab === 'role-namespaces',
        title: t`Role namespaces`,
        icon: <ArrowRightIcon />,
        link: formatPath(
          Paths.namespaceDetail,
          { namespace: namespace.name },
          { tab: 'role-namespaces' },
        ),
      },
    ];

    const breadcrumbs = [
      namespaceBreadcrumb(),
      {
        name: namespace.name,
        url:
          tab === 'access'
            ? formatPath(Paths.namespaceDetail, {
                namespace: namespace.name,
              })
            : null,
      },
      tab === 'access' && (group || user)
        ? {
            url: formatPath(
              Paths.namespaceDetail,
              { namespace: namespace.name },
              { tab },
            ),
            name: t`Access`,
          }
        : null,
      tab === 'access' && group ? { name: t`Group ${group}` } : null,
      tab === 'access' && user ? { name: t`User ${user}` } : null,
      tab === 'access' && !user && !group ? { name: t`Access` } : null,
    ].filter(Boolean);

    const repositoryUrl = getRepoURL('published');

    const noData =
      filteredCount === 0 &&
      !filterIsSet(params, [
        'is_signed',
        'keywords',
        'repository_name',
        'tags',
      ]);

    const updateParams = (params) =>
      this.updateParams(params, () => this.loadCollections());

    const ignoredParams = [
      'namespace',
      'page',
      'page_size',
      'sort',
      'tab',
      'group',
      'user',
      'view_type',
    ];

    const canEditOwners = this.hasPerm('galaxy.change_namespace');

    const repository = params.repository_name || null;
    const deleteFromRepo = this.state.deleteAll
      ? null
      : deleteCollection?.repository?.name;

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
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
          collection={updateCollection?.collection_version}
          namespace={namespace.name}
        />
        <DeleteCollectionModal
          deleteCollection={deleteCollection}
          collections={collections}
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
                addAlert: (alert) => this.addAlert(alert),
                deleteFromRepo,
              }),
            )
          }
          deleteFromRepo={deleteFromRepo}
        />
        {isOpenNamespaceModal && (
          <DeleteModal
            spinner={isNamespacePending}
            cancelAction={this.closeModal}
            deleteAction={this.deleteNamespace}
            title={t`Delete namespace?`}
            isDisabled={!confirmDelete || isNamespacePending}
          >
            <Text style={{ paddingBottom: 'var(--pf-v5-global--spacer--md)' }}>
              <Trans>
                Deleting <b>{namespace.name}</b> and its data will be lost.
              </Trans>
            </Text>
            <Checkbox
              isChecked={confirmDelete}
              onChange={(_event, val) => this.setState({ confirmDelete: val })}
              label={t`I understand that this action cannot be undone.`}
              id='delete_confirm'
            />
          </DeleteModal>
        )}
        {isOpenWisdomModal && (
          <WisdomModal
            addAlert={(alert) => this.addAlert(alert)}
            closeAction={() => this.setState({ isOpenWisdomModal: false })}
            scope={'namespace'}
            reference={this.state.namespace.name}
          />
        )}
        <PartnerHeader
          namespace={namespace}
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          pageControls={this.renderPageControls()}
        />
        {tab === 'collections' ? (
          <HubListToolbar
            count={filteredCount}
            ignoredParams={ignoredParams}
            params={params}
            updateParams={updateParams}
            {...collectionFilter({
              featureFlags,
              ignoredParams,
            })}
          />
        ) : null}
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
                    >{t`Upload collection`}</Button>
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
                  itemCount={filteredCount}
                  displaySignatures={display_signatures}
                  collectionControls={(collection) =>
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
                    <ExternalLink href='https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client'>
                      here
                    </ExternalLink>
                    .
                  </Trans>
                </div>
                <CopyURL url={repositoryUrl} />
              </div>
            </section>
          ) : null}
          {tab === 'resources' ? this.renderResources(namespace) : null}
          {tab === 'access' ? (
            <section className='body'>
              <AccessTab
                showUserRemoveModal={this.state.showUserRemoveModal}
                showUserSelectWizard={this.state.showUserSelectWizard}
                showGroupRemoveModal={this.state.showGroupRemoveModal}
                showGroupSelectWizard={this.state.showGroupSelectWizard}
                showRoleRemoveModal={this.state.showRoleRemoveModal}
                showRoleSelectWizard={this.state.showRoleSelectWizard}
                canEditOwners={canEditOwners}
                group={this.state.group}
                groups={namespace.groups}
                user={this.state.user}
                users={namespace.users}
                name={namespace.name}
                pulpObjectType='pulp_ansible/namespaces'
                selectRolesMessage={t`The selected roles will be added to this specific namespace.`}
                updateProps={(prop) => {
                  this.setState(prop);
                }}
                addUser={(user, roles) => {
                  const { users, name } = namespace;
                  const newUser = {
                    ...user,
                    object_roles: roles.map(({ name }) => name),
                  };
                  const newUsers = [...users, newUser];

                  this.updateRoles({
                    users: newUsers,
                    alertSuccess: t`User "${user.username}" has been successfully added to "${name}".`,
                    alertFailure: t`User "${user.username}" could not be added to "${name}".`,
                    stateUpdate: { showUserSelectWizard: null },
                  });
                }}
                removeUser={(user) => {
                  const { name, users } = namespace;
                  const newUsers = users.filter((u) => u !== user);
                  this.updateRoles({
                    users: newUsers,
                    alertSuccess: t`User "${user.username}" has been successfully removed from "${name}".`,
                    alertFailure: t`User "${user.username}" could not be removed from "${name}".`,
                    stateUpdate: { showUserRemoveModal: null },
                  });
                }}
                addGroup={(group, roles) => {
                  const { groups, name } = namespace;
                  const newGroup = {
                    ...group,
                    object_roles: roles.map(({ name }) => name),
                  };
                  const newGroups = [...groups, newGroup];

                  this.updateRoles({
                    groups: newGroups,
                    alertSuccess: t`Group "${group.name}" has been successfully added to "${name}".`,
                    alertFailure: t`Group "${group.name}" could not be added to "${name}".`,
                    stateUpdate: { showGroupSelectWizard: null },
                  });
                }}
                removeGroup={(group) => {
                  const { name, groups } = namespace;
                  const newGroups = groups.filter((g) => g !== group);
                  this.updateRoles({
                    groups: newGroups,
                    alertSuccess: t`Group "${group.name}" has been successfully removed from "${name}".`,
                    alertFailure: t`Group "${group.name}" could not be removed from "${name}".`,
                    stateUpdate: { showGroupRemoveModal: null },
                  });
                }}
                addUserRole={(user, roles) => {
                  const { name, users } = namespace;
                  const newUser = {
                    ...user,
                    object_roles: [
                      ...user.object_roles,
                      ...roles.map(({ name }) => name),
                    ],
                  };
                  const newUsers = users.map((u) => (u === user ? newUser : u));

                  this.updateRoles({
                    users: newUsers,
                    alertSuccess: t`User "${user.username}" roles successfully updated in "${name}".`,
                    alertFailure: t`User "${user.username}" roles could not be update in "${name}".`,
                    stateUpdate: { showRoleSelectWizard: null },
                  });
                }}
                removeUserRole={(role, user) => {
                  const { name, users } = namespace;
                  const newUser = {
                    ...user,
                    object_roles: user.object_roles.filter(
                      (name) => name !== role,
                    ),
                  };
                  const newUsers = users.map((u) => (u === user ? newUser : u));

                  this.updateRoles({
                    users: newUsers,
                    alertSuccess: t`User "${user.username}" roles successfully updated in "${name}".`,
                    alertFailure: t`User "${user.username}" roles could not be update in "${name}".`,
                    stateUpdate: { showRoleRemoveModal: null },
                  });
                }}
                addRole={(group, roles) => {
                  const { name, groups } = namespace;
                  const newGroup = {
                    ...group,
                    object_roles: [
                      ...group.object_roles,
                      ...roles.map(({ name }) => name),
                    ],
                  };
                  const newGroups = groups.map((g) =>
                    g === group ? newGroup : g,
                  );

                  this.updateRoles({
                    groups: newGroups,
                    alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
                    alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
                    stateUpdate: { showRoleSelectWizard: null },
                  });
                }}
                removeRole={(role, group) => {
                  const { name, groups } = namespace;
                  const newGroup = {
                    ...group,
                    object_roles: group.object_roles.filter(
                      (name) => name !== role,
                    ),
                  };
                  const newGroups = groups.map((g) =>
                    g === group ? newGroup : g,
                  );

                  this.updateRoles({
                    groups: newGroups,
                    alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
                    alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
                    stateUpdate: { showRoleRemoveModal: null },
                  });
                }}
                urlPrefix={formatPath(Paths.namespaceDetail, {
                  namespace: namespace.name,
                })}
              />
            </section>
          ) : null}
          {tab === 'role-namespaces' ? (
            <Navigate
              replace
              to={formatPath(
                Paths.standaloneNamespaces,
                {},
                { provider: namespace.name },
              )}
            />
          ) : null}
        </Main>
        {canSign && (
          <SignAllCertificatesModal
            name={this.state.namespace.name}
            isOpen={this.state.isOpenSignModal}
            onSubmit={() => this.signAllCertificates(namespace, repository)}
            onCancel={() => this.setState({ isOpenSignModal: false })}
          />
        )}
      </>
    );
  }

  private handleCollectionAction(pulp_href, action) {
    const collection = this.state.collections.find(
      (c) => c.collection_version.pulp_href === pulp_href,
    );
    const { name } = collection.collection_version;

    switch (action) {
      case 'upload':
        this.setState({
          updateCollection: collection,
          showImportModal: true,
        });
        break;
      case 'deprecate':
        this.addAlert({
          variant: 'info',
          title: t`Deprecation status update starting for collection "${name}".`,
        });
        CollectionAPI.setDeprecation(collection)
          .then((result) => {
            const taskId = parsePulpIDFromURL(result.data.task);
            return waitForTask(taskId).then(() => {
              const title = collection.is_deprecated
                ? t`Collection "${name}" has been successfully undeprecated.`
                : t`Collection "${name}" has been successfully deprecated.`;
              this.addAlert({
                title,
                variant: 'success',
              });
              return this.loadCollections();
            });
          })
          .catch(() => {
            this.addAlert({
              title: t`API Error: Failed to set deprecation.`,
              variant: 'warning',
            });
          });
        break;
    }
  }

  private renderResources(namespace: NamespaceType) {
    return (
      <div className='pf-v5-c-content preview'>
        <ReactMarkdown>{namespace.resources}</ReactMarkdown>
      </div>
    );
  }

  private signAllCertificates(namespace: NamespaceType, repository: string) {
    const errorAlert = (status: string | number = 500): AlertType => ({
      variant: 'danger',
      title: t`Failed to sign all collections.`,
      description: t`API Error: ${status}`,
    });

    SignCollectionAPI.sign({
      signing_service: (this.context as IAppContextType).settings
        .GALAXY_COLLECTION_SIGNING_SERVICE,
      repository_name: repository,
      namespace: namespace.name,
    })
      .then((result) => {
        // FIXME: use taskAlert
        this.addAlert({
          id: 'loading-signing',
          variant: 'success',
          title: t`Signing started for all collections in namespace "${namespace.name}".`,
        });
        this.setState({
          isOpenSignModal: false,
        });

        waitForTask(result.data.task_id)
          .then(() => {
            this.loadCollections();
          })
          .catch((error) => {
            this.addAlert(errorAlert(error));
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
        this.addAlert(errorAlert(error.response.status));
        this.setState({
          isOpenSignModal: false,
        });
      });
  }

  private loadAllCollections(params) {
    return CollectionVersionAPI.list({
      ...params,
      is_highest: true,
      namespace: this.props.routeParams.namespace,
      repository_label: '!hide_from_search',
    });
  }

  private loadCollections() {
    return this.loadAllCollections(
      ParamHelper.getReduced(this.state.params, ['tab', 'group', 'user']),
    ).then((result) => {
      this.setState({
        collections: result.data.data,
        filteredCount: result.data.meta.count,
      });
    });
  }

  private load() {
    Promise.all([
      this.loadCollections(),
      this.loadAllCollections({
        page: 1,
        page_size: 1,
      }),
      NamespaceAPI.get(this.props.routeParams.namespace, {
        include_related: 'my_permissions',
      }),
      MyNamespaceAPI.get(this.props.routeParams.namespace, {
        include_related: 'my_permissions',
      }).catch((e) => {
        // this needs fixing on backend to return nothing in these cases with 200 status
        // if view only mode is enabled disregard errors and hope
        if (
          (this.context as IAppContextType).user.is_anonymous &&
          (this.context as IAppContextType).settings
            .GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS
        ) {
          return null;
        }

        // expecting 404 - it just means we can not edit the namespace (unless both NamespaceAPI and MyNamespaceAPI fail)
        return e.response && e.response.status === 404
          ? null
          : Promise.reject(e);
      }),
    ])
      .then(
        ([
          _collections,
          {
            data: {
              meta: { count: unfilteredCount },
            },
          },
          { data: namespace },
          myNamespace,
        ]) => {
          this.setState({
            canSign: canSignNamespace(
              this.context as IAppContextType,
              myNamespace?.data,
            ),
            group: this.filterGroup(this.state.params.group, namespace.groups),
            user: this.filterUser(this.state.params.user, namespace.users),
            namespace: {
              ...namespace,
              // transform to use username, don't break when missing
              users: namespace.users
                ? namespace.users.map(({ name, object_roles }) => ({
                    username: name,
                    object_roles,
                  }))
                : [],
            },
            showControls: !!myNamespace,
            unfilteredCount,
          });
        },
      )
      .catch(() => {
        this.setState({ redirect: formatPath(Paths.notFound) });
      });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      ignoreParams: ['namespace'],
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }

  private renderPageControls() {
    if (!this.state.showControls) {
      return null;
    }

    const { canSign, collections, unfilteredCount } = this.state;
    const { ai_deny_index, can_upload_signatures } = (
      this.context as IAppContextType
    ).featureFlags;
    const repository = this.state.params.repository_name || null;

    const dropdownItems = [
      <DropdownItem
        key='edit'
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
      this.hasPerm('galaxy.delete_namespace') &&
        (unfilteredCount === 0 ? (
          <DropdownItem
            key='delete'
            onClick={() => this.setState({ isOpenNamespaceModal: true })}
          >{t`Delete namespace`}</DropdownItem>
        ) : (
          <DropdownItem
            isDisabled
            description={t`Cannot delete non-empty namespace`}
          >{t`Delete namespace`}</DropdownItem>
        )),
      <DropdownItem
        key='imports'
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
      canSign &&
        !can_upload_signatures &&
        (repository ? (
          <DropdownItem
            key='sign-collections'
            data-cy='sign-all-collections-button'
            onClick={() => this.setState({ isOpenSignModal: true })}
          >
            {t`Sign all collections in ${repository}`}
          </DropdownItem>
        ) : (
          <DropdownItem
            key='sign-collections'
            isDisabled
            description={t`Please select a repository filter`}
          >
            {t`Sign all collections`}
          </DropdownItem>
        )),
      ai_deny_index && (
        <DropdownItem
          key='wisdom-settings'
          onClick={() => this.setState({ isOpenWisdomModal: true })}
        >
          {t`Ansible Lightspeed settings`}
        </DropdownItem>
      ),
    ].filter(Boolean);

    return (
      <div
        style={{ display: 'flex', alignItems: 'center' }}
        data-cy='kebab-toggle'
      >
        {' '}
        {collections.length !== 0 && (
          <Button
            onClick={() => this.setState({ showImportModal: true })}
          >{t`Upload collection`}</Button>
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
    if (warning) {
      this.addAlert({
        title: warning,
        variant: 'warning',
      });
    }

    const newState = { showImportModal: isOpen };

    if (!isOpen) {
      newState['updateCollection'] = null;
    }

    this.setState(newState);
  }

  private deleteNamespace = () => {
    const {
      namespace: { name },
    } = this.state;
    const { queueAlert } = this.context as IAppContextType;

    this.setState({ isNamespacePending: true }, () =>
      NamespaceAPI.delete(name)
        .then(() => {
          this.setState({
            redirect: formatPath(Paths.namespaces),
            confirmDelete: false,
            isNamespacePending: false,
          });
          queueAlert({
            variant: 'success',
            title: (
              <Trans>
                Namespace &quot;{name}&quot; has been successfully deleted.
              </Trans>
            ),
          });
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
              this.addAlert({
                variant: 'danger',
                title: t`Namespace "${name}" could not be deleted.`,
                description: errorMessage(status, statusText),
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

  private renderCollectionControls(collection: CollectionVersionSearch) {
    const { namespace, showControls } = this.state;

    const canUpload = this.hasPerm('galaxy.upload_to_namespace');

    if (!showControls) {
      return;
    }

    const deleteFn = (deleteAll) => ({
      addAlert: (alert) => this.addAlert(alert),
      collection,
      openModal: () =>
        this.setState({
          deleteCollection: collection,
          confirmDelete: false,
          deleteAll,
        }),
    });

    return {
      uploadButton: canUpload && (
        <Button
          onClick={() =>
            this.handleCollectionAction(
              collection.collection_version.pulp_href,
              'upload',
            )
          }
          variant='secondary'
        >
          {t`Upload new version`}
        </Button>
      ),
      dropdownMenu: (
        <CollectionDropdown
          collection={collection}
          data-cy='collection-kebab'
          namespace={namespace}
          onDelete={deleteFn(true)}
          onDeprecate={() =>
            this.handleCollectionAction(
              collection.collection_version.pulp_href,
              'deprecate',
            )
          }
          onRemove={deleteFn(false)}
        />
      ),
    };
  }
}

export default withRouter(NamespaceDetail);
