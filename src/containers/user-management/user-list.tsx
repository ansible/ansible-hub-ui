import * as React from 'react';

import * as moment from 'moment';
import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';

import { WarningTriangleIcon } from '@patternfly/react-icons';

import { UserAPI, UserType } from '../../api';
import { ParamHelper } from '../../utilities';
import {
  StatefulDropdown,
  CompoundFilter,
  LoadingPageSpinner,
  AppliedFilters,
  Pagination,
  Sort,
  AlertList,
  closeAlertMixin,
  AlertType,
  SortFieldType,
  BaseHeader,
  Main,
} from '../../components';
import { DeleteUserModal } from './delete-user-modal';

import { Paths, formatPath } from '../../paths';

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
    this.queryUsers();
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
    const sortOptions: SortFieldType[] = [
      {
        id: 'username',
        title: 'Username',
        type: 'alpha',
      },
      { id: 'email', title: 'Email', type: 'alpha' },
      { id: 'first_name', title: 'First name', type: 'alpha' },
      { id: 'last_name', title: 'Last name', type: 'alpha' },
    ];

    if (redirect) {
      return <Redirect to={redirect}></Redirect>;
    }

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
          addAlert={(text, variant) =>
            this.setState({
              alerts: alerts.concat([{ title: text, variant: variant }]),
            })
          }
        ></DeleteUserModal>
        <BaseHeader title='Users'></BaseHeader>
        <Main>
          <Section className='body'>
            <div className='toolbar'>
              <Toolbar>
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
                <ToolbarGroup>
                  <ToolbarItem>
                    <Sort
                      options={sortOptions}
                      params={params}
                      updateParams={p =>
                        this.updateParams(p, () => this.queryUsers())
                      }
                    />
                  </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                  <ToolbarItem>
                    <Link to={Paths.createUser}>
                      <Button>Create user</Button>
                    </Link>
                  </ToolbarItem>
                </ToolbarGroup>
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
            {loading ? <LoadingPageSpinner /> : this.renderTable()}

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
      </React.Fragment>
    );
  }

  private renderTable() {
    const { users } = this.state;
    if (users.length === 0) {
      return (
        <EmptyState className='empty' variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WarningTriangleIcon} />
          <Title headingLevel='h2' size='lg'>
            No matches
          </Title>
          <EmptyStateBody>
            Please try adjusting your search query.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <table aria-label='User list' className='content-table pf-c-table'>
        <thead>
          <tr aria-labelledby='headers'>
            <th>Username</th>
            <th>Email</th>
            <th>Last name</th>
            <th>First name</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{users.map((user, i) => this.renderTableRow(user, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(user: UserType, index: number) {
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
          <StatefulDropdown
            items={[
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
              <DropdownItem key='delete' onClick={() => this.deleteUser(user)}>
                Delete
              </DropdownItem>,
            ]}
          ></StatefulDropdown>
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
