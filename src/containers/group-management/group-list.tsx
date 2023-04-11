import { Trans, t } from '@lingui/macro';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  GroupAPI,
  GroupObjectPermissionType,
  UserAPI,
  UserType,
} from 'src/api';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  DeleteGroupModal,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  GroupModal,
  ListItemActions,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';
import { RouteProps, withRouter } from 'src/utilities';
import {
  ErrorMessagesType,
  ParamHelper,
  filterIsSet,
  mapErrorMessages,
} from 'src/utilities';

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

class GroupList extends React.Component<RouteProps, IState> {
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
    const { user, hasPermission } = this.context;
    if (!user || !hasPermission('galaxy.view_group')) {
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

    const { user, hasPermission } = this.context;
    const noData =
      groups.length === 0 && !filterIsSet(params, ['name__icontains']);

    if (redirect) {
      return <Navigate to={redirect} />;
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
              hasPermission('galaxy.add_group') && (
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
              <div className='hub-list-toolbar'>
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
                              id: 'name__icontains',
                              title: t`Group name`,
                            },
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                    {!!user && hasPermission('galaxy.add_group') && (
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
                  niceNames={{
                    name__icontains: t`Group name`,
                  }}
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
    const { hasPermission } = this.context;
    const view_user = hasPermission('galaxy.view_user');

    if (!users && view_user) {
      this.queryUsers();
    }

    return (
      <DeleteGroupModal
        count={count}
        cancelAction={() => this.hideDeleteModal()}
        deleteAction={() => this.selectedGroup(this.state.selectedGroup)}
        name={name}
        users={users}
        canViewUsers={view_user}
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
      .catch((e) => {
        const { status, statusText } = e.response;
        this.setState({
          deleteModalVisible: false,
          selectedGroup: null,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Users list could not be displayed.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
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
              title: t`Changes to group "${this.state.selectedGroup}" could not be saved.`,
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
          title: t`Group name`,
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
    const { user, hasPermission } = this.context;
    const dropdownItems = [
      !!user && hasPermission('galaxy.delete_group') && (
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
      ),
    ];
    return (
      <tr data-cy={`GroupList-row-${group.name}`} key={index}>
        <td>
          <Link
            to={formatPath(Paths.groupDetail, {
              group: group.id,
            })}
          >
            {group.name}
          </Link>
        </td>
        <ListItemActions kebabItems={dropdownItems} />
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
              title: (
                <Trans>
                  Group &quot;{group.name}&quot; has been successfully deleted.
                </Trans>
              ),
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
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            groups: [],
            itemCount: 0,
            loading: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Groups list could not be displayed.`,
                description: errorMessage(status, statusText),
              },
            ],
          });
        }),
    );
  }
}

export default withRouter(GroupList);
GroupList.contextType = AppContext;
