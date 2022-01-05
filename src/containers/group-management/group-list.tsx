import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './group-management.scss';

import {
  withRouter,
  RouteComponentProps,
  Link,
  Redirect,
} from 'react-router-dom';
import {
  GroupAPI,
  UserAPI,
  UserType,
  GroupObjectPermissionType,
} from 'src/api';
import { DeleteGroupModal } from './delete-group-modal';
import {
  filterIsSet,
  mapErrorMessages,
  ParamHelper,
  ErrorMessagesType,
} from 'src/utilities';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  closeAlertMixin,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  GroupModal,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  StatefulDropdown,
} from 'src/components';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { formatPath, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  redirect?: string;
  loading: boolean;
  itemCount: number;
  alerts: AlertType[];
  groups: GroupObjectPermissionType[];
  createModalVisible: boolean;
  deleteModalCount?: number;
  deleteModalUsers?: UserType[];
  deleteModalVisible: boolean;
  editModalVisible: boolean;
  selectedGroup: GroupObjectPermissionType;
  groupError: ErrorMessagesType;
  unauthorized: boolean;
  inputText: string;
}

class GroupList extends React.Component<RouteComponentProps, IState> {
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
      params['sort'] = 'name';
    }

    this.state = {
      params: params,
      loading: true,
      itemCount: 0,
      alerts: [],
      groups: [],
      createModalVisible: false,
      deleteModalVisible: false,
      editModalVisible: false,
      selectedGroup: null,
      groupError: null,
      unauthorized: false,
      inputText: '',
    };
  }

  componentDidMount() {
    if (!this.context.user || !this.context.user.model_permissions.view_group) {
      this.setState({ unauthorized: true });
    } else {
      this.queryGroups();
    }
  }

  render() {
    const {
      redirect,
      itemCount,
      params,
      loading,
      createModalVisible,
      deleteModalVisible,
      editModalVisible,
      alerts,
      groups,
      unauthorized,
    } = this.state;

    const { user } = this.context;
    const noData = groups.length === 0 && !filterIsSet(params, ['name']);

    if (redirect) {
      return <Redirect push to={redirect} />;
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {createModalVisible ? this.renderCreateModal() : null}
        {deleteModalVisible ? this.renderDeleteModal() : null}
        {editModalVisible ? this.renderEditModal() : null}
        <BaseHeader title={t`Groups`}></BaseHeader>
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : loading ? (
          <LoadingPageSpinner />
        ) : noData ? (
          <EmptyStateNoData
            title={t`No groups yet`}
            description={t`Groups will appear once created`}
            button={
              !!user &&
              user.model_permissions.add_group && (
                <Button
                  variant='primary'
                  onClick={() => this.setState({ createModalVisible: true })}
                >
                  {t`Create`}
                </Button>
              )
            }
          />
        ) : (
          <Main>
            <section className='body'>
              <div className='hub-group-list-toolbar'>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <CompoundFilter
                          inputText={this.state.inputText}
                          onChange={(val) => this.setState({ inputText: val })}
                          updateParams={(p) =>
                            this.updateParams(p, () => this.queryGroups())
                          }
                          params={params}
                          filterConfig={[
                            {
                              id: 'name',
                              title: t`Group`,
                            },
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                    {!!user && user.model_permissions.add_group && (
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Button
                            onClick={() =>
                              this.setState({ createModalVisible: true })
                            }
                          >
                            {t`Create`}
                          </Button>
                        </ToolbarItem>
                      </ToolbarGroup>
                    )}
                  </ToolbarContent>
                </Toolbar>

                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryGroups())
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={(p) => {
                    this.updateParams(p, () => this.queryGroups());
                    this.setState({ inputText: '' });
                  }}
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort']}
                />
              </div>
              {loading ? <LoadingPageSpinner /> : this.renderTable(params)}

              <Pagination
                params={params}
                updateParams={(p) =>
                  this.updateParams(p, () => this.queryGroups())
                }
                count={itemCount}
              />
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderCreateModal() {
    return (
      <GroupModal
        onCancel={() =>
          this.setState({ createModalVisible: false, groupError: null })
        }
        onSave={(value) => this.saveGroup(value)}
        clearErrors={() => this.setState({ groupError: null })}
        errorMessage={this.state.groupError}
      />
    );
  }

  private renderEditModal() {
    return (
      <GroupModal
        onCancel={() =>
          this.setState({ editModalVisible: false, groupError: null })
        }
        onSave={(value) => this.editGroup(value)}
        clearErrors={() => this.setState({ groupError: null })}
        group={this.state.selectedGroup}
        errorMessage={this.state.groupError}
      />
    );
  }

  private renderDeleteModal() {
    const name = this.state.selectedGroup && this.state.selectedGroup.name;
    const { deleteModalUsers: users, deleteModalCount: count } = this.state;

    if (!users) {
      this.queryUsers();
    }

    return (
      <DeleteGroupModal
        count={count}
        cancelAction={() => this.hideDeleteModal()}
        deleteAction={() => this.selectedGroup(this.state.selectedGroup)}
        name={name}
        users={users}
      />
    );
  }

  private hideDeleteModal() {
    this.setState({
      deleteModalCount: null,
      deleteModalUsers: null,
      deleteModalVisible: false,
    });
  }

  private queryUsers() {
    UserAPI.list({
      groups__name: this.state.selectedGroup.name,
      page: 0,
      page_size: 10,
    })
      .then((result) =>
        this.setState({
          deleteModalUsers: result.data.data,
          deleteModalCount: result.data.meta.count,
        }),
      )
      .catch((e) =>
        this.setState({
          deleteModalVisible: false,
          selectedGroup: null,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error loading users.`,
              description: e?.message,
            },
          ],
        }),
      );
  }

  private saveGroup(value) {
    GroupAPI.create({ name: value })
      .then((result) => {
        this.setState({
          redirect: formatPath(Paths.groupDetail, {
            group: result.data.id,
          }),
          createModalVisible: false,
        });
      })
      .catch((error) => this.setState({ groupError: mapErrorMessages(error) }));
  }

  private editGroup(value) {
    GroupAPI.update(this.state.selectedGroup.id.toString(), {
      name: value,
      pulp_href: this.state.selectedGroup.pulp_href,
      id: this.state.selectedGroup.id,
    })
      .then((result) => {
        this.setState({
          redirect: '/group/' + result.data.id,
          editModalVisible: false,
          selectedGroup: null,
        });
      })
      .catch(() =>
        this.setState({
          editModalVisible: false,
          selectedGroup: null,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error editing group.`,
            },
          ],
        }),
      );
  }

  private renderTable(params) {
    const { groups } = this.state;
    if (groups.length === 0) {
      return <EmptyStateFilter />;
    }

    const sortTableOptions = {
      headers: [
        {
          title: t`Group`,
          type: 'alpha',
          id: 'name',
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
        aria-label={t`Group list`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => this.updateParams(p, () => this.queryGroups())}
        />
        <tbody>{groups.map((group, i) => this.renderTableRow(group, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(group, index: number) {
    const { user } = this.context;
    const dropdownItems = [
      <React.Fragment>
        <DropdownItem
          key='edit'
          onClick={() => {
            this.setState({
              selectedGroup: { ...group },
              redirect: formatPath(Paths.groupDetail, {
                group: group.id,
                isEditing: true,
              }),
            });
          }}
        >
          <Trans>Edit</Trans>
        </DropdownItem>

        {!!user && user.model_permissions.delete_group && (
          <DropdownItem
            aria-label='Delete'
            key='delete'
            onClick={() => {
              this.setState({
                selectedGroup: group,
                deleteModalVisible: true,
              });
            }}
          >
            <Trans>Delete</Trans>
          </DropdownItem>
        )}
      </React.Fragment>,
    ];
    return (
      <tr aria-labelledby={group.name} key={index}>
        <td>
          <Link
            to={formatPath(Paths.groupDetail, {
              group: group.id,
            })}
          >
            {group.name}
          </Link>
        </td>
        <td>
          {dropdownItems.length > 0 && (
            <StatefulDropdown items={dropdownItems} />
          )}
        </td>
      </tr>
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private selectedGroup(group) {
    GroupAPI.delete(group.id)
      .then(() => {
        this.hideDeleteModal();
        this.setState({
          loading: true,
          selectedGroup: null,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'success',
              title: t`Successfully deleted group.`,
            },
          ],
        });
        this.queryGroups();
      })
      .catch(() =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error deleting group.`,
            },
          ],
        }),
      );
  }

  private queryGroups() {
    this.setState({ loading: true }, () =>
      GroupAPI.list(this.state.params)
        .then((result) =>
          this.setState({
            groups: result.data.data,
            itemCount: result.data.meta.count,
            loading: false,
          }),
        )
        .catch((e) =>
          this.setState({
            groups: [],
            itemCount: 0,
            loading: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Error loading groups.`,
                description: e?.message,
              },
            ],
          }),
        ),
    );
  }
}

export default withRouter(GroupList);
GroupList.contextType = AppContext;
