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
  BaseHeader,
  Breadcrumbs,
  closeAlertMixin,
  EmptyStateUnauthorized,
  LoadingPageWithHeader,
  Main,
  PermissionChipSelector,
} from 'src/components';

import { twoWayMapper, ErrorMessagesType } from 'src/utilities';
import { Paths } from 'src/paths';
import {
  ActionGroup,
  Button,
  Flex,
  FlexItem,
  Form,
  Title,
  FormGroup,
  TextInput,
  Divider,
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
  descriptionError: boolean;
  descriptionMessage: string;
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
      descriptionError: false,
      descriptionMessage: null,
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
          this.setState({ redirect: Paths.notFound });
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
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const groups = Constants.PERMISSIONS;
    const {
      permissions: selectedPermissions,
      description,
      descriptionError,
      alerts,
      editPermissions,
      role,
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
        {unauthorised ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              <div>
                <div style={{ paddingBottom: '8px' }}>
                  <Title headingLevel='h2'>{t`Details`}</Title>
                </div>

                <Form>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <FormGroup
                      fieldId='name'
                      label={t`Role name`}
                      isRequired
                      style={{ width: '50%', float: 'left' }}
                    >
                      <TextInput
                        isRequired
                        isDisabled
                        id='name'
                        type='text'
                        value={this.state.name}
                      />
                    </FormGroup>
                    <FormGroup
                      style={{ width: '50%' }}
                      isRequired={true}
                      key='description'
                      fieldId='description'
                      label={t`Role description`}
                      helperTextInvalid={this.helperText(description)}
                      validated={
                        this.state.descriptionError ||
                        this.state.description.length > 150
                          ? 'error'
                          : null
                      }
                    >
                      <TextInput
                        id='role_name'
                        value={this.state.description}
                        onChange={(value) => {
                          this.setState({ description: value });
                        }}
                        type='text'
                        validated={
                          this.state.descriptionError ||
                          this.state.description.length > 150
                            ? 'error'
                            : null
                        }
                        placeholder={t`Add a role description here`}
                      />
                    </FormGroup>
                  </div>
                </Form>
              </div>
              <div>
                <br />
                <Divider />
                <br />

                <Title headingLevel='h2'>Permissions</Title>

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
                    isDisabled={
                      descriptionError ||
                      this.checkLength(this.state.description)
                    }
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
                        descriptionError: null,
                        redirect: Paths.roleList,
                      });
                    }}
                  >{t`Cancel`}</Button>
                </ActionGroup>
              </Form>
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private checkLength = (input) => {
    if (input.toString().length > 128) {
      return true;
    } else {
      return false;
    }
  };

  private helperText = (input) => {
    let text = null;
    if (input === '') {
      text = t`This field may not be blank.`;
    } else if (input.toString().length > 150) {
      text = t`Ensure this field has no more than 150 characters.`;
    } else {
      text = null;
    }
    return text;
  };

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
        err.response.status === 400
          ? this.setState({ descriptionError: true })
          : mapErrorMessages(err);
      });
  };

  private toError(validated: boolean) {
    return validated ? 'default' : 'error';
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(EditRole);
EditRole.contextType = AppContext;
