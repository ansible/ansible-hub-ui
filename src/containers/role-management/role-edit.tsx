import { t, Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';

import * as React from 'react';
import {
  errorMessage,
  parsePulpIDFromURL,
  mapErrorMessages,
} from 'src/utilities';
import { RoleAPI } from 'src/api/role';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

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
import { GroupAPI } from 'src/api';
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
  };

  itemCount: number;
  alerts: AlertType[];

  options: { id: number; name: string }[];
  selected: { id: number; name: string }[];
  editPermissions: boolean;
  savingPermissions: boolean;
  showDeleteModal: boolean;

  permissions: string[];
  originalPermissions: string[];
  redirect?: string;
  unauthorised: boolean;
  inputText: string;
  name: string;
  description: string;
  roleError: ErrorMessagesType;
  nameError: boolean;
}

class EditRole extends React.Component<RouteComponentProps, IState> {
  nonQueryStringParams = ['role'];

  constructor(props) {
    super(props);

    const id = this.props.match.params['role'];

    this.state = {
      role: null,

      params: {
        id: id,
      },
      itemCount: 0,
      alerts: [],
      roleError: null,
      options: undefined,
      selected: [],
      editPermissions: false,
      savingPermissions: false,
      showDeleteModal: false,
      nameError: false,
      permissions: [],
      originalPermissions: [],
      unauthorised: false,
      inputText: '',
      name: null,
      description: null,
    };
  }

  componentDidMount() {
    this.setState({ editPermissions: true });
    if (!this.context.user || this.context.user.is_anonymous) {
      this.setState({ unauthorised: true });
    } else {
      RoleAPI.get(this.state.params.id)
        .then((result) => {
          this.setState({
            role: result.data,
            description: result.data.description,
            name: result.data.name,
            permissions: result.data.permissions,
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.addAlert(
            t`Role "${this.state.role.name}" could not be displayed.`,
            'danger',
            errorMessage(status, statusText),
          );
        });

      this.setState({
        permissions: [
          'galaxy.add_namespace',
          'galaxy.change_namespace',
          'galaxy.delete_namespace',
        ],
        originalPermissions: [
          'galaxy.add_namespace',
          'galaxy.change_namespace',
        ],
      });
      // GroupAPI.getPermissions(this.state.params.id)
      //   .then((result) => {
      //     this.setState({
      //       originalPermissions: result.data.data.map((p) => ({
      //         id: p.id,
      //         name: p.permission,
      //       })),
      //       permissions: result.data.data.map((x) => x.permission),
      //     });
      //   })
      //   .catch((e) => {
      //     const { status, statusText } = e.response;
      //     this.addAlert(
      //       t`Permissions for role "${this.state.role.name}" could not be displayed.`,
      //       'danger',
      //       errorMessage(status, statusText),
      //     );
      //   });
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
            <Breadcrumbs
              links={[
                { url: Paths.roleList, name: t`Roles` },
                { name: role.name },
              ]}
            />
          }
        >
          <div style={{ paddingBottom: '10px' }}>
            <Trans>{role.description}</Trans>
          </div>
        </BaseHeader>
        <Main>
          <section className='body'>
            <div>
              <div style={{ paddingBottom: '8px', paddingTop: '16px' }}>
                <Title headingLevel='h2'>Details</Title>
              </div>
              <FormGroup
                isRequired={false}
                key='description'
                fieldId='description'
                label={t`Role description`}
                helperTextInvalid={
                  !this.state.roleError ? null : this.state.roleError.name
                }
              >
                <TextInput
                  id='role_name'
                  value={this.state.description}
                  onChange={(value) => {
                    this.setState({ description: value });
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
            <Form>
              <ActionGroup>
                <Button
                  variant='primary'
                  isDisabled={!name}
                  onClick={() => {
                    this.saveRole();
                  }}
                >
                  {t`Save`}
                </Button>

                <Button
                  variant='secondary'
                  onClick={() => {
                    this.setState({
                      roleError: null,
                      // nameError: null,
                      redirect: Paths.roleList,
                    });
                  }}
                >{t`Cancel`}</Button>
              </ActionGroup>
            </Form>
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



  private actionSavePermissions() {
    const { role, originalPermissions, permissions } = this.state;
    const { pulp_href } = role;
    const roleID = parsePulpIDFromURL(pulp_href);
    const promises = [];

    // Add permissions
    permissions.forEach((permission) => {
      if (!originalPermissions.find((p) => p === permission)) {
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

    this.setState({ savingPermissions: true }); // disable Save/Cancel while waiting
    Promise.all(promises).then(() =>
      this.setState({
        editPermissions: false,
        savingPermissions: false,
      }),
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

  private saveRole = () => {
    const { pulp_href } = this.state.role;
    const roleID = parsePulpIDFromURL(pulp_href) + '/';
    const { name, permissions, description } = this.state;
    RoleAPI.updatePermissions(roleID, { name, description, permissions })
      .then(() => this.setState({ redirect: Paths.roleList }))
      .catch((err) => {
        console.log('errors: ', err.response.status);
        err.response.status === 400
          ? this.setState({ nameError: true })
          : this.setState({ roleError: mapErrorMessages(err) });
      });
  };

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
