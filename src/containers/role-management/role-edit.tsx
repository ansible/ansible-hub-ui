import { t, } from '@lingui/macro';
import { i18n } from '@lingui/core';

import * as React from 'react';
import { errorMessage,   parsePulpIDFromURL, } from 'src/utilities';
import { RoleAPI } from 'src/api/role';

import {
  withRouter,
  RouteComponentProps,

  Redirect,
} from 'react-router-dom';

import {
  AlertList,
  AlertType,
  APISearchTypeAhead,
  AppliedFilters,
  BaseHeader,
  Breadcrumbs,
  closeAlertMixin,

  DateComponent,


  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  ListItemActions,
  LoadingPageWithHeader,
  Main,
  Pagination,
  PermissionChipSelector,


} from 'src/components';
import {
  GroupAPI,


} from 'src/api';
import {
  filterIsSet,
  ParamHelper,
  twoWayMapper,
  ErrorMessagesType,
} from 'src/utilities';
import { formatPath, Paths } from 'src/paths';
import {
  ActionGroup,
  Button,
  DropdownItem,
  Flex,
  FlexItem,
  Form,
  Modal,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Title,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { RoleType } from 'src/api/response-types/role';

interface IState {
  role: RoleType;
  params: {
    id: string;
    page?: number;
    page_size?: number;
    sort?: string;
    tab: string;
    isEditing: boolean;
  };

  itemCount: number;
  alerts: AlertType[];

  options: { id: number; name: string }[];
  selected: { id: number; name: string }[];
  editPermissions: boolean;
  savingPermissions: boolean;
  showDeleteModal: boolean;

  permissions: string[];
  originalPermissions: { id: number; name: string }[];
  redirect?: string;
  unauthorised: boolean;
  inputText: string;
  name: string;
  description: string;
  roleError: ErrorMessagesType;
}

class EditRole extends React.Component<RouteComponentProps, IState> {
  nonQueryStringParams = ['role'];

  constructor(props) {
    super(props);

    const id = this.props.match.params['role'];

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.state = {
      role: null,

      params: {
        id: id,
        page: 0,
        page_size: params['page_size'] || 10,
        sort: params['sort'] || 'username',
        tab: params['tab'] || 'permissions',
        isEditing: params['isEditing'] === 'true',
      },
      itemCount: 0,
      alerts: [],
      roleError: null,
      options: undefined,
      selected: [],
      editPermissions: false,
      savingPermissions: false,
      showDeleteModal: false,

      permissions: [],
      originalPermissions: [],
      unauthorised: false,
      inputText: '',
      name: null,
      description: null,
    };
  }

  componentDidMount() {
    this.setState({ editPermissions: this.state.params.isEditing });
    if (!this.context.user || this.context.user.is_anonymous) {
      this.setState({ unauthorised: true });
    } else {
      RoleAPI.get(this.state.params.id)
        .then((result) => {
          this.setState({ role: result.data });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.addAlert(
            t`Role "${this.state.role.name}" could not be displayed.`,
            'danger',
            errorMessage(status, statusText),
          );
        });

      GroupAPI.getPermissions(this.state.params.id)
        .then((result) => {
          this.setState({
            originalPermissions: result.data.data.map((p) => ({
              id: p.id,
              name: p.permission,
            })),
            permissions: result.data.data.map((x) => x.permission),
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.addAlert(
            t`Permissions for role "${this.state.role.name}" could not be displayed.`,
            'danger',
            errorMessage(status, statusText),
          );
        });
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const groups = Constants.PERMISSIONS;
    const {
      permissions: selectedPermissions,
      name,
      description,
      alerts,
      editPermissions,
      role,
      params,
      unauthorised,
    } = this.state;

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

    const { user } = this.context;

    const tabs = [{ id: 'permissions', name: t`Permissions` }];
    if (!!user && user.model_permissions.view_user) {
      tabs.push({ id: 'users', name: t`Users` });
    }

    if (!role && alerts && alerts.length) {
      return (
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
      );
    }
    if (unauthorised) {
      return <EmptyStateUnauthorized />;
    }
    if (!role) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>

        <BaseHeader
          title={editPermissions ? t`Edit role permissions` : role.name}
          breadcrumbs={
            <Breadcrumbs links={[{ url: Paths.roleList, name: t`Roles`}, { name: role.name }]} />
          }
          pageControls={this.renderControls()}
        ></BaseHeader>
        <Main>
          <section className='body'>
            <div>
              <div style={{ paddingBottom: '8px', paddingTop: '16px' }}>
                <Title headingLevel='h2'>Details</Title>
              </div>
              <FormGroup
                isRequired={false}
                key='description'
                fieldId='Description'
                label={t`Description`}
                helperTextInvalid={
                  !this.state.roleError ? null : this.state.roleError.name
                }
              >
                <TextInput
                  id='role_name'
                  value={this.state.name}
                  onChange={(value) => {
                    this.setState({ name: value });
                  }}
                  type='text'
                  validated={this.toError(!this.state.roleError)}
                  placeholder='Add a role description here'
                />
              </FormGroup>
            </div>
            <div>
              <div style={{ paddingBottom: '8px', paddingTop: '16px' }}>
                <Title headingLevel='h2'>Permissions</Title>
              </div>
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
                            !selectedPermissions.find(
                              (selected) => selected === perm,
                            ),
                        )
                        .map((value) =>
                          twoWayMapper(value, filteredPermissions),
                        )
                        .sort()}
                      selectedPermissions={selectedPermissions
                        .filter((selected) =>
                          group.object_permissions.find(
                            (perm) => selected === perm,
                          ),
                        )
                        .map((value) =>
                          twoWayMapper(value, filteredPermissions),
                        )}
                      setSelected={(perms) =>
                        this.setState({ permissions: perms })
                      }
                      menuAppendTo='inline'
                      multilingual={true}
                      isViewOnly={false}
                      onClear={() => {
                        const clearedPerms = group.object_permissions;
                        this.setState({
                          permissions: this.state.permissions.filter(
                            (x) => !clearedPerms.includes(x),
                          ),
                        });
                      }}
                      onSelect={(event, selection) => {
                        const newPerms = new Set(this.state.permissions);
                        if (
                          newPerms.has(
                            twoWayMapper(selection, filteredPermissions),
                          )
                        ) {
                          newPerms.delete(
                            twoWayMapper(selection, filteredPermissions),
                          );
                        } else {
                          newPerms.add(
                            twoWayMapper(selection, filteredPermissions),
                          );
                        }
                        this.setState({ permissions: Array.from(newPerms) });
                      }}
                    />
                  </FlexItem>
                </Flex>
              ))}
            </div>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private renderControls() {
    const { user } = this.context;
    const { editPermissions } = this.state;

    if (!user || !user.model_permissions.delete_group) {
      return null;
    }

    return (
      <ToolbarItem>
        <Button
          isDisabled={editPermissions}
          onClick={() => this.setState({ showDeleteModal: true })}
          variant='secondary'
        >
          {t`Delete`}
        </Button>
      </ToolbarItem>
    );
  }

  private actionCancelPermissions() {
    const { originalPermissions } = this.state;
    this.setState({
      editPermissions: false,
      permissions: originalPermissions.map((p) => p.name),
    });
  }

  private actionSavePermissions() {
    const { role, originalPermissions, permissions } = this.state;
    const { pulp_href } = role;
    const roleID = parsePulpIDFromURL(pulp_href);
    const promises = [];

    // Add permissions
    permissions.forEach((permission) => {
      if (!originalPermissions.find((p) => p.name === permission)) {
        promises.push(
          RoleAPI.updatePermissions(roleID, {
            permission: permission,
          }).catch((e) => {
            const { status, statusText } = e.response;
            this.addAlert(
              t`Permission "${permission}" could not be not added to group "${this.state.role}".`,
              'danger',
              errorMessage(status, statusText),
            );
          }),
        );
      }
    });

    // Remove permissions
    // originalPermissions.forEach((original) => {
    //   if (!permissions.includes(original.name)) {
    //     promises.push(
    //       GroupAPI.removePermission(group.id, original.id).catch((e) => {
    //         const { status, statusText } = e.response;
    //         this.addAlert(
    //           t`Permission "${original.name}" could not be not removed from group "${this.state.role}".`,
    //           'danger',
    //           errorMessage(status, statusText),
    //         );
    //       }),
    //     );
    //   }
    // });

    this.setState({ savingPermissions: true }); // disable Save/Cancel while waiting
    Promise.all(promises).then(() =>
      this.setState({
        editPermissions: false,
        savingPermissions: false,
      }),
    );
  }

  private renderPermissions() {
    const groups = Constants.PERMISSIONS;
    const {
      editPermissions,
      savingPermissions,
      permissions: selectedPermissions,
    } = this.state;

    const { user, featureFlags } = this.context;
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
      <section className='body'>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!editPermissions && user.model_permissions.change_group && (
            <Button onClick={() => this.setState({ editPermissions: true })}>
              {t`Edit`}
            </Button>
          )}
        </div>
        <div>
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
                        !selectedPermissions.find(
                          (selected) => selected === perm,
                        ),
                    )
                    .map((value) => twoWayMapper(value, filteredPermissions))
                    .sort()}
                  selectedPermissions={selectedPermissions
                    .filter((selected) =>
                      group.object_permissions.find(
                        (perm) => selected === perm,
                      ),
                    )
                    .map((value) => twoWayMapper(value, filteredPermissions))}
                  setSelected={(perms) => this.setState({ permissions: perms })}
                  menuAppendTo='inline'
                  multilingual={true}
                  isViewOnly={!editPermissions}
                  onClear={() => {
                    const clearedPerms = group.object_permissions;
                    this.setState({
                      permissions: this.state.permissions.filter(
                        (x) => !clearedPerms.includes(x),
                      ),
                    });
                  }}
                  onSelect={(event, selection) => {
                    const newPerms = new Set(this.state.permissions);
                    if (
                      newPerms.has(twoWayMapper(selection, filteredPermissions))
                    ) {
                      newPerms.delete(
                        twoWayMapper(selection, filteredPermissions),
                      );
                    } else {
                      newPerms.add(
                        twoWayMapper(selection, filteredPermissions),
                      );
                    }
                    this.setState({ permissions: Array.from(newPerms) });
                  }}
                />
              </FlexItem>
            </Flex>
          ))}
        </div>
        {editPermissions && (
          <Form>
            <ActionGroup>
              <Button
                variant='primary'
                isDisabled={savingPermissions}
                onClick={() => console.log('Saving!')}
              >
                {t`Save`}
              </Button>
              <Button
                variant='secondary'
                isDisabled={savingPermissions}
                onClick={() => this.actionCancelPermissions()}
              >
                {t`Cancel`}
              </Button>
            </ActionGroup>
          </Form>
        )}
      </section>
    );
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

  private toError(validated: boolean) {
    return validated ? 'default' : 'error';
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(EditRole);
EditRole.contextType = AppContext;
