import * as React from 'react';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import {
  AlertList,
  AlertType,
  APISearchTypeAhead,
  AppliedFilters,
  BaseHeader,
  Breadcrumbs,
  closeAlertMixin,
  CompoundFilter,
  LoadingPageWithHeader,
  Main,
  Pagination,
  PermissionChipSelector,
  SortTable,
  StatefulDropdown,
  Tabs,
} from '../../components';
import { GroupAPI, UserAPI, UserType } from '../../api';
import { ParamHelper, twoWayMapper } from '../../utilities';
import { formatPath, Paths } from '../../paths';
import {
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Modal,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Constants } from '../../constants';
import * as moment from 'moment';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { InsightsUserType } from '../../api/response-types/user';
import { AppContext } from '../../loaders/app-context';

interface IState {
  group: any;
  params: { id: string; tab: string; page?: number; page_size?: number };
  users: UserType[];
  allUsers: UserType[];
  itemCount: number;
  alerts: AlertType[];
  addModalVisible: boolean;
  options: { id: number; name: string }[];
  selected: { id: number; name: string }[];
  editPermissions: boolean;
  permissions: string[];
  originalPermissions: { id: number; name: string }[];
  loading: boolean;
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

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['tab']) {
      params['tab'] = 'permissions';
    }

    this.state = {
      group: null,
      users: null,
      allUsers: null,
      params: {
        id: id,
        tab: params['tab'],
        page: 0,
        page_size: params['page_size'],
      },
      itemCount: 0,
      alerts: [],
      addModalVisible: false,
      options: undefined,
      selected: [],
      editPermissions: false,
      permissions: [],
      originalPermissions: [],
      loading: false,
    };
  }

  componentDidMount() {
    GroupAPI.get(this.state.params.id).then(result => {
      this.setState({ group: result.data });
    });
    GroupAPI.getPermissions(this.state.params.id).then(result => {
      let originalPerms = [];
      result.data.data.forEach(p =>
        originalPerms.push({ id: p.id, name: p.permission }),
      );
      this.setState({
        originalPermissions: originalPerms,
        permissions: result.data.data.map(x => x.permission),
      });
    });
  }

  render() {
    const { group, params, alerts, addModalVisible, loading } = this.state;
    const { user } = this.context;

    const tabs = ['Permissions'];
    if (!!user && user.model_permissions.view_user) {
      tabs.push('Users');
    }

    if (!group || loading) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }
    if (this.state.params.tab == 'users' && !this.state.users) {
      this.queryUsers();
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }
    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={i => this.closeAlert(i)}
        ></AlertList>
        {addModalVisible ? this.renderAddModal() : null}
        <BaseHeader
          title={
            this.state.editPermissions && this.state.params.tab == 'permissions'
              ? 'Edit group permissions'
              : group.name
          }
          breadcrumbs={
            <Breadcrumbs
              links={[
                { url: Paths.groupList, name: 'Groups' },
                { name: group.name },
              ]}
            />
          }
          pageControls={this.renderControls()}
        >
          <div className='tab-link-container'>
            <div className='tabs'>
              <Tabs
                tabs={tabs}
                params={params}
                updateParams={p => this.updateParams(p)}
              />
            </div>
          </div>
        </BaseHeader>
        <Main>
          {this.state.params.tab == 'users'
            ? this.renderUsers(this.state.users)
            : null}
          {this.state.params.tab == 'permissions'
            ? this.renderPermissions()
            : null}
        </Main>
      </React.Fragment>
    );
  }
  private renderControls() {
    const { user } = this.context;

    if (this.state.params.tab == 'users') {
      return null;
    }
    return this.state.editPermissions ? (
      <ToolbarItem>
        <Button
          onClick={() => {
            // Add permissions
            this.state.permissions.forEach(permission => {
              if (
                !this.state.originalPermissions.find(p => p.name === permission)
              ) {
                GroupAPI.addPermission(this.state.group.id, {
                  permission: permission,
                }).catch(() =>
                  this.setState({
                    alerts: [
                      ...this.state.alerts,
                      {
                        variant: 'danger',
                        title: null,
                        description:
                          'Permission ' + permission + ' was not added',
                      },
                    ],
                  }),
                );
              }
            });
            //Remove permissions
            this.state.originalPermissions.forEach(original => {
              if (!this.state.permissions.includes(original.name)) {
                GroupAPI.removePermission(
                  this.state.group.id,
                  original.id,
                ).catch(() =>
                  this.setState({
                    alerts: [
                      ...this.state.alerts,
                      {
                        variant: 'danger',
                        title: null,
                        description:
                          'Permission ' + original.name + ' was not removed.',
                      },
                    ],
                  }),
                );
              }
            });
            this.setState({ editPermissions: false });
          }}
        >
          Save
        </Button>
        <Button
          variant='link'
          onClick={() => this.setState({ editPermissions: false })}
        >
          Cancel
        </Button>
      </ToolbarItem>
    ) : !!user && user.model_permissions.change_group ? (
      <ToolbarItem>
        <Button onClick={() => this.setState({ editPermissions: true })}>
          Edit
        </Button>
      </ToolbarItem>
    ) : null;
  }
  private renderPermissions() {
    const groups = Constants.PERMISSIONS;
    const selectedPermissions = this.state.permissions;
    return (
      <Section className='body'>
        <div>
          {groups.map(group => (
            <Flex
              style={{ marginTop: '16px' }}
              alignItems={{ default: 'alignItemsCenter' }}
              key={group.name}
            >
              <FlexItem style={{ minWidth: '200px' }}>{group.name}</FlexItem>
              <FlexItem grow={{ default: 'grow' }}>
                <PermissionChipSelector
                  availablePermissions={group.object_permissions
                    .filter(
                      perm =>
                        !selectedPermissions.find(
                          selected => selected === perm,
                        ),
                    )
                    .map(value =>
                      twoWayMapper(value, Constants.HUMAN_PERMISSIONS),
                    )}
                  selectedPermissions={selectedPermissions
                    .filter(selected =>
                      group.object_permissions.find(perm => selected === perm),
                    )
                    .map(value =>
                      twoWayMapper(value, Constants.HUMAN_PERMISSIONS),
                    )}
                  setSelected={perms => this.setState({ permissions: perms })}
                  menuAppendTo='inline'
                  isDisabled={!this.state.editPermissions}
                  onClear={() => {
                    const clearedPerms = group.object_permissions;
                    this.setState({
                      permissions: this.state.permissions.filter(
                        x => !clearedPerms.includes(x),
                      ),
                    });
                  }}
                  onSelect={(event, selection) => {
                    const newPerms = new Set(this.state.permissions);
                    if (
                      newPerms.has(
                        twoWayMapper(selection, Constants.HUMAN_PERMISSIONS),
                      )
                    ) {
                      newPerms.delete(
                        twoWayMapper(selection, Constants.HUMAN_PERMISSIONS),
                      );
                    } else {
                      newPerms.add(
                        twoWayMapper(selection, Constants.HUMAN_PERMISSIONS),
                      );
                    }
                    this.setState({ permissions: Array.from(newPerms) });
                  }}
                />
              </FlexItem>
            </Flex>
          ))}
        </div>
      </Section>
    );
  }

  private renderAddModal() {
    if (this.state.options === undefined) {
      this.loadOptions();
      return null;
    }
    return (
      <Modal
        variant='large'
        onClose={() => this.setState({ addModalVisible: false })}
        isOpen={true}
        aria-label='add-user-modal'
        title={''}
        header={
          <span className='pf-c-content'>
            <h2>Add selected users to group</h2>{' '}
          </span>
        }
        actions={[
          <Button
            key='add'
            variant='primary'
            onClick={() =>
              this.addUserToGroup(this.state.selected, this.state.group)
            }
          >
            Add
          </Button>,
          <Button
            key='cancel'
            variant='link'
            onClick={() => this.setState({ addModalVisible: false })}
          >
            Cancel
          </Button>,
        ]}
      >
        <APISearchTypeAhead
          results={this.state.options}
          loadResults={name =>
            UserAPI.list({ username__contains: name, page_size: 5 }).then(
              result => {
                let filteredUsers = [];
                result.data.data.forEach(user => {
                  filteredUsers.push({
                    id: user.id,
                    name: user.username,
                  });
                });
                filteredUsers = filteredUsers.filter(
                  x =>
                    !this.state.selected.find(s => s.name === x.name) &&
                    !this.state.users.find(u => u.id === x.id),
                );
                this.setState({
                  options: filteredUsers,
                });
              },
            )
          }
          onSelect={(event, selection) => {
            const selectedUser = this.state.options.find(
              x => x.name === selection,
            );
            if (selectedUser) {
              const newOptions = this.state.options.filter(
                x => x.name !== selection,
              );
              this.setState({
                selected: [...this.state.selected, selectedUser],
                options: newOptions,
              });
            } else {
              const deselectedUser = this.state.selected.find(
                x => x.name === selection,
              );
              const newSelected = this.state.selected.filter(
                x => x.name !== selection,
              );
              this.setState({
                selected: newSelected,
                options: [...this.state.options, deselectedUser],
              });
            }
          }}
          placeholderText='Select users'
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

  private addUserToGroup(selectedUsers, group) {
    const allPromises = [];
    selectedUsers.forEach(user => {
      const newUser = this.state.allUsers.find(x => x.id == user.id);
      newUser.groups = newUser.groups.concat(group);
      allPromises.push(UserAPI.update(user.id.toString(), newUser));
    });
    Promise.all(allPromises)
      .then(() => {
        this.queryUsers();
      })
      .catch(() => this.setState({ addModalVisible: false }));
  }

  private loadOptions() {
    UserAPI.list().then(result => {
      const options = result.data.data.filter(user => {
        return !this.state.users.find(u => u.id === user.id);
      });
      const a = [];
      options.forEach(option =>
        a.push({ id: option.id, name: option.username }),
      );
      this.setState({ options: a, allUsers: result.data.data });
    });
  }

  private renderUsers(users) {
    const { params, itemCount } = this.state;
    const { user } = this.context;
    if (!params['sort']) {
      params['sort'] = 'username';
    }
    return (
      <Section className='body'>
        <div className='toolbar'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    updateParams={p =>
                      this.updateParams(p, () => this.queryUsers())
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'username',
                        title: 'Username',
                      },
                      {
                        id: 'first_name',
                        title: 'First name',
                      },
                      {
                        id: 'last_name',
                        title: 'Last name',
                      },
                      {
                        id: 'email',
                        title: 'Email',
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
              {!!user && user.model_permissions.change_group && (
                <ToolbarGroup>
                  <ToolbarItem>
                    <Button
                      onClick={() => this.setState({ addModalVisible: true })}
                    >
                      Add
                    </Button>
                  </ToolbarItem>
                </ToolbarGroup>
              )}
            </ToolbarContent>
          </Toolbar>

          <Pagination
            params={params}
            updateParams={p => this.updateParams(p, () => this.queryUsers())}
            count={itemCount}
            isTop
          />
        </div>
        <div>
          <AppliedFilters
            updateParams={p => this.updateParams(p, () => this.queryUsers())}
            params={params}
            ignoredParams={['page_size', 'page', 'sort', 'id', 'tab']}
          />
        </div>
        {this.renderUsersTable(users)}
        <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
          <Pagination
            params={params}
            updateParams={p => this.updateParams(p, () => this.queryUsers())}
            count={itemCount}
          />
        </div>{' '}
      </Section>
    );
  }

  private renderUsersTable(users) {
    const { params } = this.state;
    if (users.length === 0) {
      return (
        <Section className='body'>
          <EmptyState className='empty' variant={EmptyStateVariant.full}>
            <EmptyStateIcon icon={WarningTriangleIcon} />
            <Title headingLevel='h2' size='lg'>
              No matches
            </Title>
            <EmptyStateBody>
              Please try adjusting your search query.
            </EmptyStateBody>
          </EmptyState>
        </Section>
      );
    }

    let sortTableOptions = {
      headers: [
        {
          title: 'Username',
          type: 'alpha',
          id: 'username',
        },
        {
          title: 'Email',
          type: 'alpha',
          id: 'email',
        },
        {
          title: 'Last name',
          type: 'alpha',
          id: 'last_name',
        },
        {
          title: 'First name',
          type: 'alpha',
          id: 'first_name',
        },
        {
          title: 'Created',
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
      <table aria-label='User list' className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p => this.updateParams(p, () => this.queryUsers())}
        />
        <tbody>{users.map((user, i) => this.renderTableRow(user, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(user: UserType, index: number) {
    const currentUser = this.context.user;
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
        <td>{moment(user.date_joined).fromNow()}</td>
        <td>
          {' '}
          {!!currentUser && currentUser.model_permissions.change_group && (
            <StatefulDropdown
              items={[
                <DropdownItem
                  key='delete'
                  onClick={() => this.deleteUser(user)}
                >
                  Remove
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
    }).then(result =>
      this.setState({
        users: result.data.data,
        itemCount: result.data.data.length,
        addModalVisible: false,
        loading: false,
      }),
    );
  }
  private deleteUser(user) {
    user.groups = user.groups.filter(group => {
      return group.id != this.state.params.id;
    });
    UserAPI.update(user.id, user)
      .then(() => {
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'success',
              title: null,
              description: 'Successfully removed a user from a group.',
            },
          ],
        });
        this.queryUsers();
      })
      .catch(() =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: null,
              description: 'Error removing a user from a group.',
            },
          ],
        }),
      );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}
GroupDetail.contextType = AppContext;

export default withRouter(GroupDetail);
