import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import { errorMessage } from 'src/utilities';

import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';

import {
  AlertList,
  AlertType,
  APISearchTypeAhead,
  AppliedFilters,
  BaseHeader,
  Breadcrumbs,
  closeAlertMixin,
  CompoundFilter,
  DateComponent,
  DeleteGroupModal,
  DeleteModal,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  ListItemActions,
  LoadingPageWithHeader,
  Main,
  Pagination,
  SortTable,
  Tabs,
} from 'src/components';
import {
  GroupAPI,
  UserAPI,
  UserType,
  GroupObjectPermissionType,
} from 'src/api';
import { filterIsSet, ParamHelper } from 'src/utilities';
import { formatPath, Paths } from 'src/paths';
import {
  Button,
  DropdownItem,
  Modal,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { AppContext } from 'src/loaders/app-context';

import './group-management.scss';

import GroupDetailRoleManagement from './group-detail-role-management/group-detail-role-management';

interface IState {
  group: GroupObjectPermissionType;
  params: {
    id: string;
    page?: number;
    page_size?: number;
    sort?: string;
    tab: string;
    [key: string]: string | number;
  };
  users: UserType[];
  allUsers: UserType[];
  itemCount: number;
  alerts: AlertType[];
  addModalVisible: boolean;
  options: { id: number; name: string }[];
  selected: { id: number; name: string }[];
  showDeleteModal: boolean;
  showUserRemoveModal: UserType | null;
  permissions: string[];
  originalPermissions: { id: number; name: string }[];
  redirect?: string;
  unauthorised: boolean;
  inputText: string;
}

class GroupDetail extends React.Component<RouteComponentProps, IState> {
  nonQueryStringParams = ['group'];

  userQueryStringParams = ['username', 'first_name', 'last_name', 'email'];

  roleQueryStringParams = ['role__icontains'];

  constructor(props) {
    super(props);

    const id = this.props.match.params['group'];

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.state = {
      group: null,
      users: null,
      allUsers: null,
      params: {
        id: id,
        page: 0,
        page_size: params['page_size'] || 10,
        sort:
          params['sort'] || (params['tab'] === 'access' ? 'role' : 'username'),
        tab: params['tab'] || 'access',
      },
      itemCount: 0,
      alerts: [],
      addModalVisible: false,
      options: undefined,
      selected: [],
      showDeleteModal: false,
      showUserRemoveModal: null,
      permissions: [],
      originalPermissions: [],
      unauthorised: false,
      inputText: '',
    };
  }

  componentDidMount() {
    if (!this.context.user || this.context.user.is_anonymous) {
      this.setState({ unauthorised: true });
    } else {
      this.queryGroup();
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const {
      addModalVisible,
      alerts,
      group,
      params,
      showDeleteModal,
      showUserRemoveModal,
      users,
      unauthorised,
    } = this.state;
    const { user } = this.context;

    const tabs = [{ id: 'access', name: t`Access` }];
    if (!!user && user.model_permissions.view_user) {
      tabs.push({ id: 'users', name: t`Users` });
    }

    if (!group && alerts && alerts.length) {
      return (
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
      );
    }
    if (unauthorised) {
      return <EmptyStateUnauthorized />;
    }
    if (!group) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    if (params.tab == 'users' && !users && !unauthorised) {
      this.queryUsers();
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {addModalVisible ? this.renderAddModal() : null}
        {showDeleteModal ? this.renderGroupDeleteModal() : null}
        {showUserRemoveModal ? this.renderUserRemoveModal() : null}
        <BaseHeader
          title={group.name}
          breadcrumbs={
            <Breadcrumbs
              links={[
                { url: Paths.groupList, name: t`Groups` },
                { name: group.name },
              ]}
            />
          }
          pageControls={this.renderControls()}
        >
          <div className='hub-tab-link-container'>
            <div className='tabs'>
              <Tabs
                tabs={tabs}
                params={params}
                updateParams={(p) => this.updateParams(p)}
              />
            </div>
          </div>
        </BaseHeader>
        <Main data-cy='main-tabs'>
          {params.tab == 'access' ? this.renderGroupDetail() : null}
          {params.tab == 'users' ? this.renderUsers(users) : null}
        </Main>
      </React.Fragment>
    );
  }

  private renderControls() {
    const { user } = this.context;

    if (!user || !user.model_permissions.delete_group) {
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
    return (
      <GroupDetailRoleManagement
        params={params}
        updateParams={(p) => this.updateParams(p)}
        context={this.context}
        group={group}
        addAlert={(title, variant, description) =>
          this.addAlert(title, variant, description)
        }
        nonQueryParams={this.userQueryStringParams}
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
        isOpen={true}
        aria-label={t`add-user-modal`}
        title={''}
        header={
          <span className='pf-c-content'>
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
            UserAPI.list({ username__contains: name, page_size: 5 })
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
          multiple={true}
          onClear={() =>
            this.setState({
              selected: [],
              options: [...this.state.options, ...this.state.selected],
            })
          }
          isDisabled={false}
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
          this.setState({ redirect: Paths.groupList });
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

    if (!users) {
      this.queryUsers();
    }

    return (
      <DeleteGroupModal
        count={itemCount}
        cancelAction={() => this.setState({ showDeleteModal: false })}
        deleteAction={deleteAction}
        name={group.name}
        users={users}
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
          User <b>{username}</b> will be removed from group<b>{groupname}</b>.
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
    UserAPI.list()
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
    const { user, featureFlags } = this.context;
    const noData =
      itemCount === 0 &&
      !filterIsSet(this.state.params, [
        'username',
        'first_name',
        'last_name',
        'email',
        'role__icontains',
      ]);
    let isUserMgmtDisabled = false;
    if (featureFlags) {
      isUserMgmtDisabled = featureFlags.external_authentication;
    }

    if (noData) {
      return (
        <EmptyStateNoData
          title={t`No users yet`}
          description={t`Users will appear once added to this group`}
          button={
            !!user &&
            user.model_permissions.change_group &&
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
        <div className='toolbar'>
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
                user.model_permissions.change_group &&
                !isUserMgmtDisabled && (
                  <ToolbarGroup>
                    <ToolbarItem>
                      <Button
                        onClick={() => this.setState({ addModalVisible: true })}
                      >
                        {t`Add`}
                      </Button>
                    </ToolbarItem>
                  </ToolbarGroup>
                )}
            </ToolbarContent>
          </Toolbar>

          <Pagination
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
          <Pagination
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
      <table
        aria-label={t`User list`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => this.updateParams(p, () => this.queryUsers())}
        />
        <tbody>{users.map((user, i) => this.renderTableRow(user, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(user: UserType, index: number) {
    const currentUser = this.context.user;
    const { featureFlags } = this.context;
    let isUserMgmtDisabled = false;

    const dropdownItems = [
      !!currentUser &&
        currentUser.model_permissions.change_group &&
        !isUserMgmtDisabled && (
          <DropdownItem
            key='delete'
            onClick={() => this.setState({ showUserRemoveModal: user })}
          >
            {t`Remove`}
          </DropdownItem>
        ),
    ];
    if (featureFlags) {
      isUserMgmtDisabled = featureFlags.external_authentication;
    }
    return (
      <tr data-cy={`GroupDetail-users-${user.username}`} key={index}>
        <td>
          <Link to={formatPath(Paths.userDetail, { userID: user.id })}>
            {user.username}
          </Link>
        </td>
        <td>{user.email}</td>
        <td>{user.last_name}</td>
        <td>{user.first_name}</td>
        <td>
          <DateComponent date={user.date_joined} />
        </td>
        <ListItemActions kebabItems={dropdownItems} />
      </tr>
    );
  }

  private queryUsers() {
    const params = {
      ...ParamHelper.getReduced(this.state.params, [
        ...this.roleQueryStringParams,
      ]),
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
          this.setState({ redirect: Paths.notFound });
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

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(GroupDetail);
GroupDetail.contextType = AppContext;
