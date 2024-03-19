import { Trans, t } from '@lingui/macro';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core';
import { Td } from '@patternfly/react-table';
import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { RoleAPI, type RoleType } from 'src/api';
import {
  AlertList,
  type AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  DateComponent,
  DeleteModal,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  ExpandableRow,
  HubPagination,
  ListItemActions,
  LoadingSpinner,
  Main,
  PermissionCategories,
  RoleListTable,
  Tooltip,
  closeAlert,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ParamHelper,
  type RouteProps,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  translateLockedRole,
  withRouter,
} from 'src/utilities';

interface IState {
  roles: RoleType[];
  roleCount: number;
  redirect?: string;
  alerts: AlertType[];
  loading: boolean;
  inputText: string;
  params: {
    page?: number;
    page_size?: number;
  };
  unauthorized: boolean;
  selectedRole: RoleType[];
  expandedRoleNames: string[];
  roleToEdit: RoleType;
  showDeleteModal: boolean;
}

export class RoleList extends Component<RouteProps, IState> {
  static contextType = AppContext;

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

    if (!params['name__startswith']) {
      params['name__startswith'] = 'galaxy.';
    }

    this.state = {
      redirect: null,
      roles: [],
      alerts: [],
      loading: true,
      inputText: '',
      params,
      roleCount: 0,
      unauthorized: false,
      selectedRole: null,
      expandedRoleNames: [],
      roleToEdit: null,
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    if (
      !(this.context as IAppContextType).user ||
      (this.context as IAppContextType).user.is_anonymous
    ) {
      this.setState({ loading: false, unauthorized: true });
    } else {
      this.queryRoles();
    }
  }

  render() {
    const {
      redirect,
      params,
      loading,
      roleCount,
      alerts,
      unauthorized,
      showDeleteModal,
      roleToEdit,
      roles,
    } = this.state;

    const noData =
      roleCount === 0 && !filterIsSet(params, ['name__icontains', 'locked']);

    if (redirect) {
      return <Navigate to={redirect} />;
    }

    const isSuperuser = (this.context as IAppContextType).user.is_superuser;

    const addRoles = isSuperuser && (
      <Link to={formatPath(Paths.createRole)}>
        <Button variant={'primary'}>{t`Add roles`}</Button>
      </Link>
    );

    let tableHeader = [
      {
        title: '',
        type: 'none',
        id: 'expander',
      },
      {
        title: t`Role name`,
        type: 'alpha',
        id: 'name',
      },
      {
        title: t`Description`,
        type: 'none',
        id: 'description',
      },
      {
        title: t`Created`,
        type: 'number',
        id: 'pulp_created',
      },
      {
        title: t`Editable`,
        type: 'none',
        id: 'locked',
      },
    ];
    if (isSuperuser) {
      tableHeader = [
        ...tableHeader,
        {
          title: '',
          type: 'none',
          id: 'kebab',
        },
      ];
    }

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        {showDeleteModal && roleToEdit && (
          <DeleteModal
            cancelAction={() =>
              this.setState({ showDeleteModal: false, roleToEdit: null })
            }
            deleteAction={() => this.deleteRole(roleToEdit)}
            title={t`Delete role?`}
            data-cy='DeleteModal'
          >
            <Trans>
              <p>
                Role <b>{roleToEdit.name}</b> will be permanently deleted.
              </p>
              <p>
                This will also remove all associated permissions under this
                role.
              </p>
            </Trans>
          </DeleteModal>
        )}
        <BaseHeader title={t`Roles`} />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`There are currently no roles`}
            description={t`Please add a role by using the button below.`}
            button={addRoles}
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <section className='body'>
                <div className='hub-toolbar'>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <CompoundFilter
                            inputText={this.state.inputText}
                            onChange={(text) =>
                              this.setState({ inputText: text })
                            }
                            updateParams={(p) =>
                              this.updateParams(p, () => this.queryRoles())
                            }
                            params={params}
                            filterConfig={[
                              {
                                id: 'name__icontains',
                                title: t`Role name`,
                              },

                              {
                                id: 'locked',
                                title: t`Editable`,
                                inputType: 'select',
                                options: [
                                  {
                                    id: 'true',
                                    title: t`Built-in`,
                                  },
                                  {
                                    id: 'false',
                                    title: t`Editable`,
                                  },
                                ],
                              },
                            ]}
                          />
                        </ToolbarItem>
                        <ToolbarItem>{addRoles}</ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>
                  <HubPagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryRoles())
                    }
                    count={roleCount}
                    isTop
                  />
                </div>
                <div>
                  <AppliedFilters
                    updateParams={(p) => {
                      this.updateParams(p, () => this.queryRoles());
                      this.setState({ inputText: '' });
                    }}
                    params={params}
                    ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                    niceValues={{
                      locked: { true: t`Built-in`, false: t`Editable` },
                      name__startswith: { 'galaxy.': t`true` },
                    }}
                    niceNames={{
                      locked: t`Editable`,
                      name__icontains: t`Role name`,
                      name__startswith: t`Galaxy only`,
                    }}
                  />
                </div>
                <>
                  {' '}
                  {roleCount ? (
                    <RoleListTable
                      params={this.state.params}
                      updateParams={(p) => {
                        this.updateParams(p, () => this.queryRoles());
                      }}
                      tableHeader={{ headers: tableHeader }}
                    >
                      {roles.map((role, i) => (
                        <ExpandableRow
                          key={role.name}
                          expandableRowContent={
                            <PermissionCategories
                              permissions={role.permissions}
                              showCustom
                            />
                          }
                          data-cy={`RoleListTable-ExpandableRow-row-${role.name}`}
                          colSpan={6}
                          rowIndex={i}
                        >
                          <Td data-cy='name-field'>{role.name}</Td>
                          <Td>
                            {translateLockedRole(role.name, role.description)}
                          </Td>
                          <Td>
                            <DateComponent date={role.pulp_created} />
                          </Td>

                          <Td>
                            {role.locked ? (
                              <Tooltip
                                content={t`Built-in roles cannot be edited or deleted.`}
                              >
                                <span
                                  style={{ whiteSpace: 'nowrap' }}
                                >{t`Built-in`}</span>
                              </Tooltip>
                            ) : (
                              t`Editable`
                            )}
                          </Td>
                          {isSuperuser && (
                            <ListItemActions
                              kebabItems={this.renderDropdownItems(role)}
                            />
                          )}
                        </ExpandableRow>
                      ))}
                    </RoleListTable>
                  ) : (
                    <EmptyStateFilter />
                  )}
                  <HubPagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryRoles())
                    }
                    count={roleCount}
                  />
                </>
              </section>
            )}
          </Main>
        )}
      </>
    );
  }

  private deleteRole({ pulp_href, name }) {
    const roleID = parsePulpIDFromURL(pulp_href);
    RoleAPI.delete(roleID)
      .then(() =>
        this.addAlert(
          t`Role "${name}" has been successfully deleted.`,
          'success',
        ),
      )
      .catch((e) => {
        const { status, statusText } = e.response;
        this.addAlert(
          t`Role "${name}" could not be deleted.`,
          'danger',
          errorMessage(status, statusText),
        );
      })
      .then(() => {
        this.queryRoles();
        this.setState({ showDeleteModal: false, roleToEdit: null });
      });
  }

  private renderDropdownItems = (role) => {
    const { pulp_href, locked } = role;
    const roleID = parsePulpIDFromURL(pulp_href);

    const editItem = (
      <DropdownItem
        key='edit'
        isDisabled={locked}
        onClick={() =>
          this.setState({
            redirect: formatPath(Paths.roleEdit, { role: roleID }),
          })
        }
      >
        {t`Edit`}
      </DropdownItem>
    );
    const deleteItem = (
      <DropdownItem
        key='delete'
        isDisabled={locked}
        onClick={() =>
          this.setState({
            showDeleteModal: true,
            roleToEdit: role,
          })
        }
      >
        {t`Delete`}
      </DropdownItem>
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hasPermission } = this.context as IAppContextType;
    const dropdownItems = (this.context as IAppContextType).user.is_superuser
      ? [
          // hasPermission('galaxy.change_containerregistryremote') &&
          locked ? (
            <Tooltip key='edit' content={t`Built-in roles cannot be edited.`}>
              {editItem}
            </Tooltip>
          ) : (
            editItem
          ),
          // hasPermission('galaxy.delete_containerregistryremote') &&
          locked ? (
            <Tooltip
              key='delete'
              content={t`Built-in roles cannot be deleted.`}
            >
              {deleteItem}
            </Tooltip>
          ) : (
            deleteItem
          ),
        ]
      : null;

    return dropdownItems;
  };

  private queryRoles = () => {
    const { params } = this.state;
    this.setState({ loading: true }, () => {
      RoleAPI.list(params)
        .then((result) => {
          this.setState({
            roles: result.data.results,
            roleCount: result.data.count,
            loading: false,
          });
        })
        .catch((err) => {
          const { status, statusText } = err.response;
          this.setState({
            roleCount: 0,
            loading: false,
          });
          this.addAlert(
            t`Roles list could not be displayed.`,
            'danger',
            errorMessage(status, statusText),
          );
        });
    });
  };

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
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
}

export default withRouter(RoleList);
