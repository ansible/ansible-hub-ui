import { Trans, t } from '@lingui/macro';
import {
  Button,
  Modal,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  GroupAPI,
  GroupObjectPermissionType,
  UserAPI,
  UserType,
} from 'src/api';
import {
  APISearchTypeAhead,
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  Breadcrumbs,
  CompoundFilter,
  DateComponent,
  DeleteGroupModal,
  DeleteModal,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  HubPagination,
  LinkTabs,
  ListItemActions,
  LoadingPageWithHeader,
  Main,
  SortTable,
  closeAlert,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';
import { RouteProps, withRouter } from 'src/utilities';
import { ParamHelper, filterIsSet } from 'src/utilities';
import GroupDetailRoleManagement from './group-detail-role-management/group-detail-role-management';

interface IState {
  addModalVisible: boolean;
  alerts: AlertType[];
  allUsers: UserType[];
  group: GroupObjectPermissionType;
  inputText: string;
  itemCount: number;
  options: { id: number; name: string }[];
  originalPermissions: { id: number; name: string }[];
  params: {
    [key: string]: string | number;
    id: string;
    page?: number;
    page_size?: number;
    sort?: string;
    tab: string;
  };
  permissions: string[];
  redirect?: string;
  selected: { id: number; name: string }[];
  showDeleteModal: boolean;
  showUserRemoveModal: UserType | null;
  unauthorised: boolean;
  users: UserType[];
}

class GroupDetail extends Component<RouteProps, IState> {
  static contextType = AppContext;

  userQueryStringParams = ['username', 'first_name', 'last_name', 'email'];

  constructor(props) {
    super(props);

    const id = this.props.routeParams.group;

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.state = {
      addModalVisible: false,
      alerts: [],
      allUsers: null,
      group: null,
      inputText: '',
      itemCount: 0,
      options: undefined,
      originalPermissions: [],
      params: {
        id,
        page: 0,
        page_size: params['page_size'] || 10,
        sort:
          params['sort'] || (params['tab'] === 'access' ? 'role' : 'username'),
        tab: params['tab'] || 'access',
      },
      permissions: [],
      selected: [],
      showDeleteModal: false,
      showUserRemoveModal: null,
      unauthorised: false,
      users: null,
    };
  }

  componentDidMount() {
    const { user, hasPermission } = this.context as IAppContextType;
    if (!user || user.is_anonymous || !hasPermission('galaxy.view_group')) {
      this.setState({ unauthorised: true });
    } else {
      this.queryGroup();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const id = this.props.routeParams.group;
      const params = ParamHelper.parseParamString(this.props.location.search, [
        'page',
        'page_size',
      ]);
      this.setState({
        params: {
          ...params,
          id,
          page_size: params['page_size'] || 10,
          sort:
            params['sort'] ||
            (params['tab'] === 'access' ? 'role' : 'username'),
          tab: params['tab'] || 'access',
        },
      });
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const {
      addModalVisible,
      alerts,
      group,
      params,
      showDeleteModal,
      showUserRemoveModal,
      unauthorised,
      users,
    } = this.state;
    const { user, hasPermission } = this.context as IAppContextType;

    if (!group && alerts && alerts.length) {
      return (
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
      );
    }
    if (unauthorised) {
      return <EmptyStateUnauthorized />;
    }
    if (!group) {
      return <LoadingPageWithHeader />;
    }

    if (params.tab == 'users' && !users && !unauthorised) {
      this.queryUsers();
      return <LoadingPageWithHeader />;
    }

    const tabs = [
      {
        active: params.tab === 'access',
        title: t`Access`,
        link: formatPath(
          Paths.groupDetail,
          { group: group.id },
          { tab: 'access' },
        ),
      },
      !!user &&
        hasPermission('galaxy.view_user') && {
          active: params.tab === 'users',
          title: t`Users`,
          link: formatPath(
            Paths.groupDetail,
            { group: group.id },
            { tab: 'users' },
          ),
        },
    ];

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
        {addModalVisible ? this.renderAddModal() : null}
        {showDeleteModal ? this.renderGroupDeleteModal() : null}
        {showUserRemoveModal ? this.renderUserRemoveModal() : null}
        <BaseHeader
          title={group.name}
          breadcrumbs={
            <Breadcrumbs
              links={[
                { url: formatPath(Paths.groupList), name: t`Groups` },
                { name: group.name },
              ]}
            />
          }
          pageControls={this.renderControls()}
        >
          <div className='hub-tab-link-container'>
            <div className='tabs'>
              <LinkTabs tabs={tabs} />
            </div>
          </div>
        </BaseHeader>
        <Main data-cy='main-tabs'>
          {params.tab == 'access' ? this.renderGroupDetail() : null}
          {params.tab == 'users' ? this.renderUsers(users) : null}
        </Main>
      </>
    );
  }

  private renderControls() {
    const { hasPermission, user } = this.context as IAppContextType;

    if (!user || !hasPermission('galaxy.delete_group')) {
      return null;
    }

    return (
      <ToolbarItem>
        <Button
          onClick={() => this.setState({ showDeleteModal: true })}
          variant='secondary'
        >
          {t`Delete`}
        </Button>
      </ToolbarItem>
    );
  }

  private renderGroupDetail() {
    const { params, group } = this.state;
    const { hasPermission } = this.context as IAppContextType;
    const canEdit = hasPermission('galaxy.change_group');

    return (
      <GroupDetailRoleManagement
        addAlert={(title, variant, description) =>
          this.addAlert(title, variant, description)
        }
        canEdit={canEdit}
        group={group}
        nonQueryParams={this.userQueryStringParams}
        params={params}
        updateParams={(p) => this.updateParams(p)}
      />
    );
  }

  private renderAddModal() {
    if (this.state.options === undefined) {
      this.loadOptions();
      return null;
    }

    const close = () => this.setState({ addModalVisible: false, selected: [] });

    return (
      <Modal
        variant='large'
        onClose={close}
        isOpen
        aria-label={t`add-user-modal`}
        title={''}
        header={
          <span className='pf-v5-c-content'>
            <h2>{t`Add selected users to group`}</h2>{' '}
          </span>
        }
        actions={[
          <Button
            key='add'
            variant='primary'
            isDisabled={this.state.selected.length === 0}
            onClick={() =>
              this.addUserToGroup(this.state.selected, this.state.group).then(
                close,
              )
            }
          >
            {t`Add`}
          </Button>,
          <Button key='cancel' variant='link' onClick={close}>
            {t`Cancel`}
          </Button>,
        ]}
      >
        <APISearchTypeAhead
          results={this.state.options}
          loadResults={(name) =>
            UserAPI.list({ username__contains: name, page_size: 1000 })
              .then((result) => {
                let filteredUsers = [];
                result.data.data.forEach((user) => {
                  filteredUsers.push({
                    id: user.id,
                    name: user.username,
                  });
                });
                filteredUsers = filteredUsers.filter(
                  (x) =>
                    !this.state.selected.find((s) => s.name === x.name) &&
                    !this.state.users.find((u) => u.id === x.id),
                );
                this.setState({
                  options: filteredUsers,
                });
              })
              .catch((e) => {
                const { status, statusText } = e.response;
                this.addAlert(
                  t`Users list could not be displayed.`,
                  'danger',
                  errorMessage(status, statusText),
                );
              })
          }
          onSelect={(event, selection) => {
            const selectedUser = this.state.options.find(
              (x) => x.name === selection,
            );
            if (selectedUser) {
              const newOptions = this.state.options.filter(
                (x) => x.name !== selection,
              );
              this.setState({
                selected: [...this.state.selected, selectedUser],
                options: newOptions,
              });
            } else {
              const deselectedUser = this.state.selected.find(
                (x) => x.name === selection,
              );
              const newSelected = this.state.selected.filter(
                (x) => x.name !== selection,
              );
              this.setState({
                selected: newSelected,
                options: [...this.state.options, deselectedUser],
              });
            }
          }}
          placeholderText={t`Select users`}
          selections={this.state.selected}
          menuAppendTo={'parent'}
          multiple
          onClear={() =>
            this.setState({
              selected: [],
              options: [...this.state.options, ...this.state.selected],
            })
          }
          style={{ overflowY: 'auto', maxHeight: '350px' }}
        />
      </Modal>
    );
  }

  private renderGroupDeleteModal() {
    const { group, users, itemCount } = this.state;

    const deleteAction = () => {
      GroupAPI.delete(group.id)
        .then(() => {
          this.setState({
            showDeleteModal: false,
          });
          this.addAlert(
            t`Group "${group}" has been successfully deleted.`,
            'success',
          );
          this.setState({ redirect: formatPath(Paths.groupList) });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.addAlert(
            t`Group "${group}" could not be deleted.`,
            'danger',
            errorMessage(status, statusText),
          );
        });
    };
    const { hasPermission } = this.context as IAppContextType;
    const view_user = hasPermission('galaxy.view_user');

    if (!users && view_user) {
      this.queryUsers();
    }

    return (
      <DeleteGroupModal
        count={itemCount}
        cancelAction={() => this.setState({ showDeleteModal: false })}
        deleteAction={deleteAction}
        name={group.name}
        users={users}
        canViewUsers={view_user}
      />
    );
  }

  private renderUserRemoveModal() {
    const group = this.state.group;
    const user = this.state.showUserRemoveModal as UserType;

    const { username } = user;
    const groupname = group.name;

    return (
      <DeleteModal
        cancelAction={() => this.setState({ showUserRemoveModal: null })}
        deleteAction={() => this.deleteUser(user)}
        title={t`Remove user from group?`}
      >
        <Trans>
          User <b>{username}</b> will be removed from group <b>{groupname}</b>.
        </Trans>
      </DeleteModal>
    );
  }

  private addUserToGroup(selectedUsers, group) {
    return Promise.all(
      selectedUsers.map(({ id }) => {
        const user = this.state.allUsers.find((x) => x.id === id);
        return UserAPI.update(id.toString(), {
          ...user,
          groups: [...user.groups, group],
        });
      }),
    )
      .then(() => {
        this.addAlert(
          t`User "${selectedUsers[0].name}" has been successfully added to group "${this.state.group.name}".`,
          'success',
        );
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        this.addAlert(
          t`User "${selectedUsers[0].name}" could not be added to group "${this.state.group.name}".`,
          'danger',
          errorMessage(status, statusText),
        );
      })
      .then(() => this.queryUsers());
  }

  private loadOptions() {
    UserAPI.list({ page_size: 1000 })
      .then((result) => {
        const options = result.data.data
          .filter((user) => !this.state.users.find((u) => u.id === user.id))
          .map((option) => ({ id: option.id, name: option.username }));
        this.setState({ options, allUsers: result.data.data });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        this.addAlert(
          t`Users list could not be displayed.`,
          'danger',
          errorMessage(status, statusText),
        );
      });
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

  private renderUsers(users) {
    const { itemCount, params } = this.state;
    const { user, featureFlags, hasPermission } = this
      .context as IAppContextType;
    const noData =
      itemCount === 0 &&
      !filterIsSet(this.state.params, [
        'username',
        'first_name',
        'last_name',
        'email',
        'role__icontains',
      ]);
    const isUserMgmtDisabled = featureFlags.external_authentication;

    if (noData) {
      return (
        <EmptyStateNoData
          title={t`No users yet`}
          description={t`Users will appear once added to this group`}
          button={
            !!user &&
            hasPermission('galaxy.change_group') &&
            !isUserMgmtDisabled && (
              <Button
                variant='primary'
                onClick={() => this.setState({ addModalVisible: true })}
              >
                {t`Add`}
              </Button>
            )
          }
        />
      );
    }

    return (
      <section className='body'>
        <div className='hub-toolbar'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    inputText={this.state.inputText}
                    onChange={(text) => this.setState({ inputText: text })}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryUsers())
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'username',
                        title: t`Username`,
                      },
                      {
                        id: 'first_name',
                        title: t`First name`,
                      },
                      {
                        id: 'last_name',
                        title: t`Last name`,
                      },
                      {
                        id: 'email',
                        title: t`Email`,
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
              {!!user &&
                hasPermission('galaxy.change_group') &&
                !isUserMgmtDisabled && (
                  <ToolbarGroup>
                    <ToolbarItem>
                      <Button
                        onClick={() => this.setState({ addModalVisible: true })}
                      >{t`Add`}</Button>
                    </ToolbarItem>
                  </ToolbarGroup>
                )}
            </ToolbarContent>
          </Toolbar>

          <HubPagination
            params={params}
            updateParams={(p) => this.updateParams(p, () => this.queryUsers())}
            count={itemCount}
            isTop
          />
        </div>
        <div>
          <AppliedFilters
            updateParams={(p) => {
              this.updateParams(p, () => this.queryUsers());
              this.setState({ inputText: '' });
            }}
            params={params}
            ignoredParams={[
              'id',
              'page',
              'page_size',
              'sort',
              'tab',
              'role__icontains',
            ]}
          />
        </div>
        {this.renderUsersTable(users)}
        <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
          <HubPagination
            params={params}
            updateParams={(p) => this.updateParams(p, () => this.queryUsers())}
            count={itemCount}
          />
        </div>{' '}
      </section>
    );
  }

  private renderUsersTable(users) {
    const { params } = this.state;
    if (users.length === 0) {
      return <EmptyStateFilter />;
    }

    const sortTableOptions = {
      headers: [
        {
          title: t`Username`,
          type: 'alpha',
          id: 'username',
        },
        {
          title: t`Email`,
          type: 'alpha',
          id: 'email',
        },
        {
          title: t`Last name`,
          type: 'alpha',
          id: 'last_name',
        },
        {
          title: t`First name`,
          type: 'alpha',
          id: 'first_name',
        },
        {
          title: t`Created`,
          type: 'numeric',
          id: 'date_joined',
        },
        {
          title: '',
          type: 'none',
          id: 'kebab',
        },
      ],
    };

    return (
      <Table aria-label={t`User list`}>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => this.updateParams(p, () => this.queryUsers())}
        />
        <Tbody>{users.map((user, i) => this.renderTableRow(user, i))}</Tbody>
      </Table>
    );
  }

  private renderTableRow(user: UserType, index: number) {
    const currentUser = (this.context as IAppContextType).user;
    const { featureFlags, hasPermission } = this.context as IAppContextType;
    const isUserMgmtDisabled = featureFlags.external_authentication;
    const dropdownItems = [
      !!currentUser &&
        hasPermission('galaxy.change_group') &&
        !isUserMgmtDisabled && (
          <DropdownItem
            key='delete'
            onClick={() => this.setState({ showUserRemoveModal: user })}
          >
            {t`Remove`}
          </DropdownItem>
        ),
    ];
    return (
      <Tr data-cy={`GroupDetail-users-${user.username}`} key={index}>
        <Td>
          <Link to={formatPath(Paths.userDetail, { userID: user.id })}>
            {user.username}
          </Link>
        </Td>
        <Td>{user.email}</Td>
        <Td>{user.last_name}</Td>
        <Td>{user.first_name}</Td>
        <Td>
          <DateComponent date={user.date_joined} />
        </Td>
        <ListItemActions kebabItems={dropdownItems} />
      </Tr>
    );
  }

  private queryUsers() {
    const params = {
      ...ParamHelper.getReduced(this.state.params, ['role__icontains']),
      sort: ParamHelper.validSortParams(
        this.state.params['sort'],
        this.userQueryStringParams,
        'username',
      ),
      groups__name: this.state.group.name,
    };

    UserAPI.list({
      ...params,
    })
      .then((result) =>
        this.setState({
          users: result.data.data,
          itemCount: result.data.meta.count,
        }),
      )
      .catch((e) => {
        const { status, statusText } = e.response;
        this.addAlert(
          t`Users list could not be displayed.`,
          'danger',
          errorMessage(status, statusText),
        );
      });
  }

  private queryGroup() {
    GroupAPI.get(this.state.params.id)
      .then((result) => {
        this.setState({ group: result.data });
      })
      .catch((e) => {
        if (e.response.status === 404) {
          this.setState({ redirect: formatPath(Paths.notFound) });
        } else {
          const { status, statusText } = e.response;
          this.addAlert(
            t`Group could not be displayed.`,
            'danger',
            errorMessage(status, statusText),
          );
        }
      });

    this.setState({
      users: null,
    });
  }

  private deleteUser(user) {
    user.groups = user.groups.filter((group) => {
      return group.id != this.state.params.id;
    });
    const { name } = this.state.group;
    UserAPI.update(user.id, user)
      .then(() => {
        this.setState({
          showUserRemoveModal: null,
        });
        this.addAlert(
          t`User "${user.username}" has been successfully removed from group "${name}".`,
          'success',
        );
        this.queryUsers();
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        this.addAlert(
          t`User "${user.username}" could not be removed from group "${name}".`,
          'danger',
          errorMessage(status, statusText),
        );
      });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      ignoreParams: ['group'],
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }
}

export default withRouter(GroupDetail);
