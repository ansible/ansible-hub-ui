import { t } from '@lingui/macro';
import * as React from 'react';
import './user-management.scss';

import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Button,
  DropdownItem,
  Label,
  Tooltip,
  LabelGroup,
} from '@patternfly/react-core';

import { UserPlusIcon } from '@patternfly/react-icons';

import { UserAPI, UserType } from 'src/api';
import { ParamHelper, filterIsSet } from 'src/utilities';
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
  EmptyStateUnauthorized,
  EmptyStateFilter,
  DateComponent,
} from 'src/components';
import { DeleteUserModal } from './delete-user-modal';

import { Paths, formatPath } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

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
  unauthorized: boolean;
  inputText: string;
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
      unauthorized: false,
      inputText: '',
    };
  }

  componentDidMount() {
    if (!this.context.user || !this.context.user.model_permissions.view_user) {
      this.setState({ unauthorized: true });
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
      unauthorized,
    } = this.state;

    const { user } = this.context;

    if (redirect) {
      return <Redirect push to={redirect} />;
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
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
        <BaseHeader title={t`Users`}></BaseHeader>
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              <div className='user-list-toolbar'>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <CompoundFilter
                          inputText={this.state.inputText}
                          onChange={(input) =>
                            this.setState({ inputText: input })
                          }
                          updateParams={(p) =>
                            this.updateParams(p, () => this.queryUsers())
                          }
                          params={params}
                          filterConfig={[
                            {
                              id: 'username__contains',
                              title: t`Username`,
                            },
                            {
                              id: 'first_name__contains',
                              title: t`First name`,
                            },
                            {
                              id: 'last_name__contains',
                              title: t`Last name`,
                            },
                            {
                              id: 'email__contains',
                              title: t`Email`,
                            },
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                    {!!user && user.model_permissions.add_user ? (
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Link to={Paths.createUser}>
                            <Button>{t`Create`}</Button>
                          </Link>
                        </ToolbarItem>
                      </ToolbarGroup>
                    ) : null}
                  </ToolbarContent>
                </Toolbar>

                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryUsers())
                  }
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
                  ignoredParams={['page_size', 'page', 'sort']}
                  niceNames={{
                    username__contains: 'Username',
                    first_name__contains: 'First name',
                    last_name__contains: 'Last name',
                    email__contains: 'Email',
                  }}
                />
              </div>
              {loading ? <LoadingPageSpinner /> : this.renderTable(params)}
              <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryUsers())
                  }
                  count={itemCount}
                />
              </div>
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderTable(params) {
    const { users } = this.state;
    if (users.length === 0) {
      return filterIsSet(params, [
        'username__contains',
        'first_name__contains',
        'last_name__contains',
        'email__contains',
      ]) ? (
        <EmptyStateFilter />
      ) : (
        <EmptyStateNoData
          title={t`No users yet`}
          description={t`Users will appear once created`}
          button={
            <Link to={Paths.createUser}>
              <Button variant={'primary'}>{t`Create`}</Button>
            </Link>
          }
        />
      );
    }

    let sortTableOptions = {
      headers: [
        {
          title: t`Username`,
          type: 'alpha',
          id: 'username',
        },
        {
          title: t`First name`,
          type: 'alpha',
          id: 'first_name',
          className: 'pf-m-wrap',
        },
        {
          title: t`Last name`,
          type: 'alpha',
          id: 'last_name',
          className: 'pf-m-wrap',
        },
        {
          title: t`Email`,
          type: 'alpha',
          id: 'email',
        },
        {
          id: 'groups',
          title: t`Groups`,
          type: 'none',
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
      <table aria-label={t`User list`} className='content-table pf-c-table'>
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
              {t`Edit`}
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
          {t`Delete`}
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
            <>
              {' '}
              <Tooltip
                content={t`Super users have all system permissions regardless of what groups they are in.`}
              >
                <Label icon={<UserPlusIcon />} color='orange'>
                  {t`Super user`}
                </Label>
              </Tooltip>
            </>
          )}
        </td>
        <td>{user.first_name}</td>
        <td>{user.last_name}</td>
        <td>{user.email}</td>
        <td>
          <LabelGroup>
            {user.groups.map((g) => (
              <Label key={g.id}>{g.name}</Label>
            ))}
          </LabelGroup>
        </td>
        <td>
          <DateComponent date={user.date_joined} />
        </td>
        <td style={{ paddingRight: '0px', textAlign: 'right' }}>
          {dropdownItems.length > 0 ? (
            <StatefulDropdown items={dropdownItems}></StatefulDropdown>
          ) : null}
        </td>
      </tr>
    );
  }

  private deleteUser = (user) => {
    this.setState({ deleteUser: user, showDeleteModal: true });
  };

  private closeModal = (didDelete) =>
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
      UserAPI.list(this.state.params).then((result) =>
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
