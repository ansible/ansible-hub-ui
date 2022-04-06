import React from 'react';
import { t, Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';
import { AppContext } from 'src/loaders/app-context';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  AlertType,
  Pagination,
  BaseHeader,
  closeAlertMixin,
  CompoundFilter,
  EmptyStateFilter,
  LoadingPageSpinner,
  Main,
  AlertList,
  EmptyStateUnauthorized,
  EmptyStateNoData,
  AppliedFilters,
  DeleteModal,
  RoleListTable,
  ExpandableRow,
  ListItemActions,
  PermissionChipSelector,
} from 'src/components';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { RoleType } from 'src/api/response-types/role';
import {
  errorMessage,
  filterIsSet,
  ParamHelper,
  parsePulpIDFromURL,
  twoWayMapper,
} from 'src/utilities';

import { RoleAPI } from 'src/api/role';
import { Paths, formatPath } from 'src/paths';
import { Constants } from 'src/constants';

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

export class RoleList extends React.Component<RouteComponentProps, IState> {
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
      params['sort'] = '-pulp_created';
    }

    this.state = {
      roles: [],
      alerts: [],
      loading: true,
      inputText: '',
      params: params,
      roleCount: 0,
      unauthorized: false,
      selectedRole: null,
      expandedRoleNames: [],
      roleToEdit: null,
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    if (!this.context.user || !this.context.user.model_permissions.view_group) {
      this.setState({ loading: false, unauthorized: true });
    } else {
      this.queryRoles();
    }
  }

  render() {
    const {
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

    const groups = Constants.PERMISSIONS;

    const { featureFlags } = this.context;
    let isUserMgmtDisabled = false;
    const filteredPermissions = { ...Constants.HUMAN_PERMISSIONS };
    if (featureFlags) {
      isUserMgmtDisabled = featureFlags.external_authentication;
    }
    if (isUserMgmtDisabled) {
      Constants.USER_GROUP_MGMT_PERMISSIONS.forEach((perm) => {
        if (perm in filteredPermissions) {
          delete filteredPermissions[perm];
        }
      });
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {showDeleteModal && roleToEdit && (
          <DeleteModal
            cancelAction={() =>
              this.setState({ showDeleteModal: false, roleToEdit: null })
            }
            deleteAction={() => this.deleteRole(roleToEdit)}
            title={t`Delete role?`}
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
        <BaseHeader title={t`Roles`}></BaseHeader>
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`There are currently no roles`}
            description={t`Please add a role by using the button below.`}
            button={
              <Link to={Paths.createRole}>
                <Button variant={'primary'}>{t`Add roles`}</Button>
              </Link>
            }
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingPageSpinner />
            ) : (
              <section className='body'>
                <div className='role-list'>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <CompoundFilter
                            inputText={this.state.inputText}
                            onChange={(text) =>
                              this.setState({ inputText: text })
                            }
                            updateParams={(p) => {
                              p['page'] = 1;
                              this.updateParams(p, () => this.queryRoles());
                            }}
                            params={params}
                            filterConfig={[
                              {
                                id: 'name__icontains',
                                title: t`Role name`,
                              },

                              {
                                id: 'locked',
                                title: t`Status`,
                                inputType: 'select',
                                options: [
                                  {
                                    id: 'true',
                                    title: t`Locked`,
                                  },
                                  {
                                    id: 'false',
                                    title: t`Unlocked`,
                                  },
                                ],
                              },
                            ]}
                          />
                        </ToolbarItem>
                        <ToolbarItem>
                          <Link to={Paths.createRole}>
                            <Button variant={'primary'}>{t`Add roles`}</Button>
                          </Link>
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>
                  <Pagination
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
                    niceNames={{
                      name__icontains: t`Role name`,
                      locked: t`Locked?`,
                    }}
                  />
                </div>
                {loading ? (
                  <LoadingPageSpinner />
                ) : (
                  <>
                    {' '}
                    {roleCount ? (
                      <RoleListTable
                        isStickyHeader={false}
                        params={this.state.params}
                        updateParams={(p) => {
                          this.updateParams(p, () => this.queryRoles());
                        }}
                        isCompact={true}
                        tableHeader={{
                          headers: [
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
                              title: t`Locked`,
                              type: 'none',
                              id: 'locked',
                            },
                            {
                              title: '',
                              type: 'none',
                              id: 'kebab',
                            },
                          ],
                        }}
                      >
                        {roles.map((role) => (
                          <ExpandableRow
                            key={role.name}
                            expandableRowContent={
                              <>
                                {groups.map((group) => (
                                  <Flex
                                    style={{ marginTop: '16px' }}
                                    alignItems={{ default: 'alignItemsCenter' }}
                                    key={group.name}
                                    className={group.name}
                                  >
                                    <FlexItem style={{ minWidth: '200px' }}>
                                      {i18n._(group.label)}
                                    </FlexItem>
                                    <FlexItem grow={{ default: 'grow' }}>
                                      <PermissionChipSelector
                                        availablePermissions={group.object_permissions
                                          .filter(
                                            (perm) =>
                                              !role.permissions.find(
                                                (selected) => selected === perm,
                                              ),
                                          )
                                          .map((value) =>
                                            twoWayMapper(
                                              value,
                                              filteredPermissions,
                                            ),
                                          )
                                          .sort()}
                                        selectedPermissions={role.permissions
                                          .filter((selected) =>
                                            group.object_permissions.find(
                                              (perm) => selected === perm,
                                            ),
                                          )
                                          .map((value) =>
                                            twoWayMapper(
                                              value,
                                              filteredPermissions,
                                            ),
                                          )}
                                        menuAppendTo='inline'
                                        multilingual={true}
                                        isViewOnly={true}
                                      />
                                    </FlexItem>
                                  </Flex>
                                ))}
                              </>
                            }
                          >
                            <td>{role.name}</td>
                            <td>{role.description}</td>
                            <td>{role.locked ? 'Locked' : 'Unlocked'}</td>
                            <ListItemActions
                              kebabItems={this.renderDropdownItems(role)}
                            />
                          </ExpandableRow>
                        ))}
                      </RoleListTable>
                    ) : (
                      <EmptyStateFilter />
                    )}
                    <Pagination
                      params={params}
                      updateParams={(p) =>
                        this.updateParams(p, () => this.queryRoles())
                      }
                      count={roleCount}
                    />
                  </>
                )}
              </section>
            )}
          </Main>
        )}
      </React.Fragment>
    );
  }

  private deleteRole({ pulp_href, name }) {
    const roleID = parsePulpIDFromURL(pulp_href);
    RoleAPI.delete(roleID)
      .then(() =>
        this.addAlert(
          <Trans>
            Remote registry &quot;{name}&quot; has been successfully deleted.
          </Trans>,
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
    const { pulp_href } = role;
    const roleID = parsePulpIDFromURL(pulp_href);

    const dropdownItems = [
      // this.context.user.model_permissions.change_containerregistry && (

      <DropdownItem
        key='edit'
      >
        <Link to={formatPath(Paths.roleEdit, {role: roleID})}>
          <Trans>Edit</Trans>
        </Link>
      </DropdownItem>,
      // ),
      // this.context.user.model_permissions.delete_containerregistry && (
      <DropdownItem
        key='delete'
        onClick={() =>
          this.setState({
            showDeleteModal: true,
            roleToEdit: role,
          })
        }
      >
        <Trans>Delete</Trans>
      </DropdownItem>,
      // ),
    ];
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

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
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

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(RoleList);
RoleList.contextType = AppContext;
