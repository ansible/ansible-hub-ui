import * as React from 'react';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

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
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageWithHeader,
  Main,
  Pagination,
  PermissionChipSelector,
  SortTable,
  StatefulDropdown,
  Tabs,
} from 'src/components';
import { GroupAPI, UserAPI, UserType } from 'src/api';
import { filterIsSet, ParamHelper, twoWayMapper } from 'src/utilities';
import { formatPath, Paths } from 'src/paths';
import {
  ActionGroup,
  Button,
  DropdownItem,
  Flex,
  FlexItem,
  Form,
  Modal,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { DeleteGroupModal } from './delete-group-modal';
import { DeleteModal } from 'src/components/delete-modal/delete-modal';

interface IState {
  group: any;
  params: {
    id: string;
    page?: number;
    page_size?: number;
    sort?: string;
    tab: string;
  };
  users: UserType[];
  allUsers: UserType[];
  itemCount: number;
  alerts: AlertType[];
  addModalVisible: boolean;
  options: { id: number; name: string }[];
  selected: { id: number; name: string }[];
  editPermissions: boolean;
  showDeleteModal: boolean;
  showUserRemoveModal: UserType | null;
  permissions: string[];
  originalPermissions: { id: number; name: string }[];
}

class GroupDetail extends React.Component<RouteComponentProps, IState> {
  nonQueryStringParams = ['group'];

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
        sort: params['sort'] || 'username',
        tab: params['tab'] || 'permissions',
      },
      itemCount: 0,
      alerts: [],
      addModalVisible: false,
      options: undefined,
      selected: [],
      editPermissions: false,
      showDeleteModal: false,
      showUserRemoveModal: null,
      permissions: [],
      originalPermissions: [],
    };
  }

  componentDidMount() {
    GroupAPI.get(this.state.params.id)
      .then((result) => {
        this.setState({ group: result.data });
      })
      .catch((e) =>
        this.addAlert(_`Error loading group.`, 'danger', e.message),
      );

    GroupAPI.getPermissions(this.state.params.id)
      .then((result) => {
        this.setState({
          originalPermissions: result.data.data.map((p) => ({
            id: p.id,
            name: p.permission,
          })),
          permissions: result.data.data.map((x) => x.permission),
        });
      })
      .catch((e) =>
        this.addAlert(_`Error loading permissions.`, 'danger', e.message),
      );
  }

  render() {
    const {
      addModalVisible,
      alerts,
      editPermissions,
      group,
      params,
      showDeleteModal,
      showUserRemoveModal,
      users,
    } = this.state;
    const { user } = this.context;

    const tabs = [_`Permissions`];
    if (!!user && user.model_permissions.view_user) {
      tabs.push(_`Users`);
    }

    if (!group && alerts && alerts.length) {
      return (
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
      );
    }
    if (!group) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    if (params.tab == 'users' && !users) {
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
          title={
            editPermissions && params.tab == 'permissions'
              ? _`Edit group permissions`
              : group.name
          }
          breadcrumbs={
            <Breadcrumbs
              links={[
                { url: Paths.groupList, name: _`Groups` },
                { name: group.name },
              ]}
            />
          }
          pageControls={this.renderControls()}
        >
          <div className='tab-link-container'>
            <div className='tabs'>
              <Tabs
                isDisabled={editPermissions}
                disabledTitle={_`Please finish editing permissions first.`}
                tabs={tabs}
                params={params}
                updateParams={(p) => this.updateParams(p)}
              />
            </div>
          </div>
        </BaseHeader>
        <Main>
          {params.tab == 'permissions' ? this.renderPermissions() : null}
          {params.tab == 'users' ? this.renderUsers(users) : null}
        </Main>
      </React.Fragment>
    );
  }

  private renderControls() {
    const { user } = this.context;
    const { editPermissions } = this.state;

    if (!user || !user.model_permissions.delete_group) {
      return null;
    }

    return (
      <ToolbarItem>
        <Button
          isDisabled={editPermissions}
          onClick={() => this.setState({ showDeleteModal: true })}
          variant='secondary'
        >
          {_`Delete`}
        </Button>
      </ToolbarItem>
    );
  }

  private actionSavePermissions() {
    const { group, originalPermissions, permissions } = this.state;

    // Add permissions
    permissions.forEach((permission) => {
      if (!originalPermissions.find((p) => p.name === permission)) {
        GroupAPI.addPermission(group.id, {
          permission: permission,
        }).catch((e) =>
          this.addAlert(
            _`Permission ${permission} was not added.`,
            'danger',
            e.message,
          ),
        );
      }
    });

    // Remove permissions
    originalPermissions.forEach((original) => {
      if (!permissions.includes(original.name)) {
        GroupAPI.removePermission(group.id, original.id).catch((e) =>
          this.addAlert(
            _`Permission ${original.name} was not removed.`,
            'danger',
            e.message,
          ),
        );
      }
    });

    this.setState({ editPermissions: false });
  }

  private renderPermissions() {
    const groups = Constants.PERMISSIONS;
    const { editPermissions, permissions: selectedPermissions } = this.state;
    const { user, featureFlags } = this.context;
    let isUserMgmtDisabled = false;
    let filteredPermissions = { ...Constants.HUMAN_PERMISSIONS };
    if (featureFlags) {
      isUserMgmtDisabled = featureFlags.external_authentication;
    }
    if (isUserMgmtDisabled) {
      Constants.USER_GROUP_MGMT_PERMISSIONS.forEach((perm) => {
        if (filteredPermissions.hasOwnProperty(perm)) {
          delete filteredPermissions[perm];
        }
      });
    }

    return (
      <section className='body'>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!editPermissions && user.model_permissions.change_group && (
            <Button onClick={() => this.setState({ editPermissions: true })}>
              {_`Edit`}
            </Button>
          )}
        </div>
        <div>
          {groups.map((group) => (
            <Flex
              style={{ marginTop: '16px' }}
              alignItems={{ default: 'alignItemsCenter' }}
              key={group.name}
              className={group.name}
            >
              <FlexItem style={{ minWidth: '200px' }}>{group.name}</FlexItem>
              <FlexItem grow={{ default: 'grow' }}>
                <PermissionChipSelector
                  availablePermissions={group.object_permissions
                    .filter(
                      (perm) =>
                        !selectedPermissions.find(
                          (selected) => selected === perm,
                        ),
                    )
                    .map((value) => twoWayMapper(value, filteredPermissions))
                    .sort()}
                  selectedPermissions={selectedPermissions
                    .filter((selected) =>
                      group.object_permissions.find(
                        (perm) => selected === perm,
                      ),
                    )
                    .map((value) => twoWayMapper(value, filteredPermissions))}
                  setSelected={(perms) => this.setState({ permissions: perms })}
                  menuAppendTo='inline'
                  isViewOnly={!editPermissions}
                  onClear={() => {
                    const clearedPerms = group.object_permissions;
                    this.setState({
                      permissions: this.state.permissions.filter(
                        (x) => !clearedPerms.includes(x),
                      ),
                    });
                  }}
                  onSelect={(event, selection) => {
                    const newPerms = new Set(this.state.permissions);
                    if (
                      newPerms.has(twoWayMapper(selection, filteredPermissions))
                    ) {
                      newPerms.delete(
                        twoWayMapper(selection, filteredPermissions),
                      );
                    } else {
                      newPerms.add(
                        twoWayMapper(selection, filteredPermissions),
                      );
                    }
                    this.setState({ permissions: Array.from(newPerms) });
                  }}
                />
              </FlexItem>
            </Flex>
          ))}
        </div>
        {editPermissions && (
          <Form>
            <ActionGroup>
              <Button
                variant='primary'
                onClick={() => this.actionSavePermissions()}
              >
                {_`Save`}
              </Button>
              <Button
                variant='secondary'
                onClick={() => this.setState({ editPermissions: false })}
              >
                {_`Cancel`}
              </Button>
            </ActionGroup>
          </Form>
        )}
      </section>
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
        aria-label='add-user-modal'
        title={''}
        header={
          <span className='pf-c-content'>
            <h2>{_`Add selected users to group`}</h2>{' '}
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
            {_`Add`}
          </Button>,
          <Button key='cancel' variant='link' onClick={close}>
            {_`Cancel`}
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
              .catch((e) =>
                this.addAlert(_`Error loading users.`, 'danger', e.message),
              )
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
          placeholderText={_`Select users`}
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
          this.addAlert(_`Successfully deleted group.`, 'success');
          this.props.history.push(Paths.groupList);
        })
        .catch((e) =>
          this.addAlert(_`Error deleting group.`, 'danger', e.message),
        );
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

    return (
      <DeleteModal
        cancelAction={() => this.setState({ showUserRemoveModal: null })}
        deleteAction={() => this.deleteUser(user)}
        title={_`Remove user from group?`}
      >
        <b>{user.username}</b> will be removed from <b>{group.name}</b>.
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
      .catch((e) =>
        this.addAlert(_`Error updating users.`, 'danger', e.message),
      )
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
      .catch((e) =>
        this.addAlert(_`Error loading users.`, 'danger', e.message),
      );
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
    const { params, itemCount } = this.state;
    const { user, featureFlags } = this.context;
    const noData =
      itemCount === 0 &&
      !filterIsSet(params, ['username', 'first_name', 'last_name', 'email']);
    let isUserMgmtDisabled = false;
    if (featureFlags) {
      isUserMgmtDisabled = featureFlags.external_authentication;
    }

    if (noData) {
      return (
        <EmptyStateNoData
          title={_`No users yet`}
          description={_`Users will appear once added to this group`}
          button={
            !!user &&
            user.model_permissions.change_group &&
            !isUserMgmtDisabled && (
              <Button
                variant='primary'
                onClick={() => this.setState({ addModalVisible: true })}
              >
                {_`Add`}
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
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryUsers())
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'username',
                        title: _`Username`,
                      },
                      {
                        id: 'first_name',
                        title: _`First name`,
                      },
                      {
                        id: 'last_name',
                        title: _`Last name`,
                      },
                      {
                        id: 'email',
                        title: _`Email`,
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
                        {_`Add`}
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
            updateParams={(p) => this.updateParams(p, () => this.queryUsers())}
            params={params}
            ignoredParams={['page_size', 'page', 'sort', 'id', 'tab']}
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

    let sortTableOptions = {
      headers: [
        {
          title: _`Username`,
          type: 'alpha',
          id: 'username',
        },
        {
          title: _`Email`,
          type: 'alpha',
          id: 'email',
        },
        {
          title: _`Last name`,
          type: 'alpha',
          id: 'last_name',
        },
        {
          title: _`First name`,
          type: 'alpha',
          id: 'first_name',
        },
        {
          title: _`Created`,
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
      <table aria-label={_`User list`} className='content-table pf-c-table'>
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
    if (featureFlags) {
      isUserMgmtDisabled = featureFlags.external_authentication;
    }
    return (
      <tr aria-labelledby={user.username} key={index}>
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
        <td>
          {' '}
          {!!currentUser &&
            currentUser.model_permissions.change_group &&
            !isUserMgmtDisabled && (
              <StatefulDropdown
                items={[
                  <DropdownItem
                    key='delete'
                    onClick={() => this.setState({ showUserRemoveModal: user })}
                  >
                    {_`Remove`}
                  </DropdownItem>,
                ]}
              ></StatefulDropdown>
            )}
        </td>
      </tr>
    );
  }

  private queryUsers() {
    UserAPI.list({
      ...this.state.params,
      ...{ groups__name: this.state.group.name },
    })
      .then((result) =>
        this.setState({
          users: result.data.data,
          itemCount: result.data.meta.count,
        }),
      )
      .catch((e) =>
        this.addAlert(_`Error loading users.`, 'danger', e.message),
      );
  }

  private deleteUser(user) {
    user.groups = user.groups.filter((group) => {
      return group.id != this.state.params.id;
    });

    UserAPI.update(user.id, user)
      .then(() => {
        this.setState({
          showUserRemoveModal: null,
        });
        this.addAlert(_`Successfully removed a user from a group.`, 'success');
        this.queryUsers();
      })
      .catch((e) =>
        this.addAlert(
          _`Error removing user from a group.`,
          'danger',
          e.message,
        ),
      );
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
