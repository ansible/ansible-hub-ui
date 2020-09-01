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
  SortTable,
  StatefulDropdown,
  Tabs,
} from '../../components';
import { GroupAPI, UserAPI, UserType } from '../../api';
import { ParamHelper } from '../../utilities';
import { formatPath, Paths } from '../../paths';
import {
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Modal,
  Select,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import * as moment from 'moment';
import { WarningTriangleIcon } from '@patternfly/react-icons';

interface IState {
  group: any;
  params: { id: string; tab: string; page?: number; page_size?: number };
  users: UserType[];
  itemCount: number;
  alerts: AlertType[];
  addModalVisible: boolean;
  options: { id: number; name: string }[];
  selected: { id: number; name: string }[];
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
    console.log(params);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['tab']) {
      params['tab'] = 'permissions';
    }

    this.state = {
      group: null,
      users: null,
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
      loading: false,
    };
  }

  componentDidMount() {
    GroupAPI.get(this.state.params.id).then(result => {
      this.setState({ group: result.data });
    });
  }

  render() {
    const { group, params, alerts, addModalVisible, loading } = this.state;

    const tabs = ['Permissions', 'Users'];

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
          title={group.name}
          breadcrumbs={
            <Breadcrumbs
              links={[
                { url: Paths.groupList, name: 'Groups' },
                { name: group.name },
              ]}
            />
          }
          pageControls={null}
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
          {this.state.params.tab == 'users' ? (
            this.renderUsers(this.state.users)
          ) : (
            <Section className='body'></Section>
          )}
        </Main>
      </React.Fragment>
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
          loadResults={this.loadResults}
          onSelect={(event, selection) => {
            const selectedUser = this.state.options.find(
              x => x.name === selection,
            );
            const newOptions = this.state.options.filter(
              x => x.name !== selection,
            );
            this.setState({
              selected: [...this.state.selected, selectedUser],
              options: newOptions,
            });
          }}
          placeholderText='Select groups'
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
      UserAPI.get(user.id.toString()).then(result => {
        const newUser = result.data;
        newUser.groups = newUser.groups.concat(group);
        allPromises.push(UserAPI.update(user.id.toString(), newUser));
      });
    });
    Promise.all(allPromises)
      .then(() => {
        this.setState({ addModalVisible: false, loading: true });
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
      this.setState({ options: a });
    });
  }

  private loadResults(name) {
    UserAPI.list({ username__contains: name, page_size: 5 }).then(result =>
      this.setState({ options: result.data.data }),
    );
  }

  private renderUsers(users) {
    const { params, itemCount } = this.state;
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
              <ToolbarGroup>
                <ToolbarItem>
                  <Button
                    onClick={() => this.setState({ addModalVisible: true })}
                  >
                    Add users
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
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
              <DropdownItem key='delete' onClick={() => this.deleteUser(user)}>
                Remove this User from Group
              </DropdownItem>,
            ]}
          ></StatefulDropdown>
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

export default withRouter(GroupDetail);
