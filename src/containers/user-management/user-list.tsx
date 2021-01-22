import * as React from 'react';

import * as moment from 'moment';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Button,
  DropdownItem,
  Label,
  Tooltip,
} from '@patternfly/react-core';

import { UserPlusIcon } from '@patternfly/react-icons';

import { UserAPI, UserType } from '../../api';
import { ParamHelper, filterIsSet } from '../../utilities';
import {
  StatefulDropdown,
  CompoundFilter,
  LoadingPageSpinner,
  AppliedFilters,
  Pagination,
  SortTable,
  AlertList,
  closeAlertMixin,
  AlertType,
  BaseHeader,
  Main,
  EmptyStateNoData,
  EmptyStateUnauthorised,
  EmptyStateFilter,
} from '../../components';
import { DeleteUserModal } from './delete-user-modal';

import { Paths, formatPath } from '../../paths';
import { AppContext } from '../../loaders/app-context';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  redirect?: string;
  users: UserType[];
  loading: boolean;
  itemCount: number;
  deleteUser: UserType;
  showDeleteModal: boolean;
  alerts: AlertType[];
}

class UserList extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = 'username';
    }

    this.state = {
      deleteUser: undefined,
      showDeleteModal: false,
      params: params,
      users: [],
      loading: true,
      itemCount: 0,
      alerts: [],
    };
  }

  componentDidMount() {
    if (!this.context.user || !this.context.user.model_permissions.view_user) {
      this.setState({ redirect: Paths.notFound });
    } else {
      this.queryUsers();
    }
  }

  render() {
    const {
      params,
      itemCount,
      loading,
      redirect,
      showDeleteModal,
      deleteUser,
      alerts,
    } = this.state;

    const { user } = this.context;

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={i => this.closeAlert(i)}
        ></AlertList>
        <DeleteUserModal
          isOpen={showDeleteModal}
          closeModal={this.closeModal}
          user={deleteUser}
          addAlert={(text, variant, description = undefined) =>
            this.setState({
              alerts: alerts.concat([
                { title: text, variant: variant, description: description },
              ]),
            })
          }
        ></DeleteUserModal>
        <BaseHeader title='Users'></BaseHeader>
        {redirect ? (
          <EmptyStateUnauthorised />
        ) : (
          <Main>
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
                    {!!user && user.model_permissions.add_user ? (
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Link to={Paths.createUser}>
                            <Button>Create user</Button>
                          </Link>
                        </ToolbarItem>
                      </ToolbarGroup>
                    ) : null}
                  </ToolbarContent>
                </Toolbar>

                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryUsers())
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={p =>
                    this.updateParams(p, () => this.queryUsers())
                  }
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort']}
                />
              </div>
              {loading ? <LoadingPageSpinner /> : this.renderTable(params)}

              <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryUsers())
                  }
                  count={itemCount}
                />
              </div>
            </Section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderTable(params) {
    const { users } = this.state;
    if (users.length === 0) {
      return filterIsSet(params, [
        'username',
        'first_name',
        'last_name',
        'email',
      ]) ? (
        <EmptyStateFilter />
      ) : (
        <EmptyStateNoData />
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
          id: 'groups',
          title: 'Groups',
          type: 'none',
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
    const dropdownItems = [];
    if (
      !!this.context.user &&
      this.context.user.model_permissions.change_user
    ) {
      dropdownItems.push(
        <DropdownItem
          key='edit'
          component={
            <Link
              to={formatPath(Paths.editUser, {
                userID: user.id,
              })}
            >
              Edit
            </Link>
          }
        />,
      );
    }
    if (
      !!this.context.user &&
      this.context.user.model_permissions.delete_user
    ) {
      dropdownItems.push(
        <DropdownItem key='delete' onClick={() => this.deleteUser(user)}>
          Delete
        </DropdownItem>,
      );
    }
    return (
      <tr aria-labelledby={user.username} key={index}>
        <td>
          <Link to={formatPath(Paths.userDetail, { userID: user.id })}>
            {user.username}
          </Link>

          {user.is_superuser && (
            <Tooltip content='Super users have all system permissions regardless of what groups they are in.'>
              <Label icon={<UserPlusIcon />} color='orange'>
                Super user
              </Label>
            </Tooltip>
          )}
        </td>
        <td>{user.email}</td>
        <td>{user.last_name}</td>
        <td>{user.first_name}</td>
        <td>
          {user.groups.map(g => (
            <Label key={g.id}>{g.name}</Label>
          ))}
        </td>
        <td>{moment(user.date_joined).fromNow()}</td>
        <td>
          {dropdownItems.length > 0 ? (
            <StatefulDropdown items={dropdownItems}></StatefulDropdown>
          ) : null}
        </td>
      </tr>
    );
  }

  private deleteUser = user => {
    this.setState({ deleteUser: user, showDeleteModal: true });
  };

  private closeModal = didDelete =>
    this.setState(
      {
        deleteUser: undefined,
        showDeleteModal: false,
      },
      () => {
        if (didDelete) {
          this.queryUsers();
        }
      },
    );

  private queryUsers() {
    this.setState({ loading: true }, () =>
      UserAPI.list(this.state.params).then(result =>
        this.setState({
          users: result.data.data,
          itemCount: result.data.meta.count,
          loading: false,
        }),
      ),
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(UserList);

UserList.contextType = AppContext;
