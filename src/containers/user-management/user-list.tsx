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

import {
  InfoCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';

import { ActiveUserAPI, MeType, UserAPI, UserType } from '../../api';
import { ParamHelper } from '../../utilities';
import {
  LoadingPageWithHeader,
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

    this.state = { params: params, users: [], loading: true, itemCount: 0 };
  }

  componentDidMount() {
    ActiveUserAPI.isPartnerEngineer().then(response => {
      const me: MeType = response.data;
      if (!me.is_partner_engineer) {
        this.setState({ redirect: Paths.notFound });
      } else {
        this.queryUsers();
      }
    });
  }

  render() {
    const { users, params, itemCount, loading, redirect } = this.state;
    const sortOptions: SortFieldType[] = [
      {
        id: 'username',
        title: 'Username',
        type: 'alpha',
      },
      { id: 'email', title: 'Email', type: 'alpha' },
      { id: 'first_name', title: 'Fist name', type: 'alpha' },
      { id: 'last_name', title: 'Last name', type: 'alpha' },
    ];

    if (redirect) {
      return <Redirect to={redirect}></Redirect>;
    }
    return (
      <React.Fragment>
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
                    <Button>Create user</Button>
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
              <DropdownItem key='delete' onClick={() => console.log('edit')}>
                Delete
              </DropdownItem>,
            ]}
          ></StatefulDropdown>
        </td>
      </tr>
    );
  }

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
