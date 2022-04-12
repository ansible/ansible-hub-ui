import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';
import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import {
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  PermissionChipSelector,
  Main,
  AlertType,
} from 'src/components';
import {
  ActionGroup,
  Button,
  Flex,
  FlexItem,
  Form,
  TextInput,
  FormGroup,
  Title,
  Divider,
  Spinner,
} from '@patternfly/react-core';

import {
  twoWayMapper,
  mapErrorMessages,
  ErrorMessagesType,
  errorMessage,
} from 'src/utilities';
import { Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { Constants } from 'src/constants';
import { RoleAPI } from 'src/api/role';

interface IState {
  saving: boolean;
  errorMessages: any;
  redirect?: string;
  permissions: string[];
  name: string;
  description: string;
  roleError: ErrorMessagesType;
  nameError: boolean;
  descriptionError: boolean;
  alerts: AlertType[];
}

class RoleCreate extends React.Component<RouteComponentProps, IState> {
  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      saving: false,
      nameError: false,
      errorMessages: {},
      permissions: [],
      name: '',
      description: '',
      roleError: null,
      descriptionError: false,
      alerts: [],
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }
    const {
      nameError,
      descriptionError,
      errorMessages,
      description,
      permissions: selectedPermissions,
      name,

      saving,
    } = this.state;
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

    const notAuthorised = !this.context.user || this.context.user.is_anonymous;
    const breadcrumbs = [
      { url: Paths.roleList, name: t`Roles` },
      { name: t`Create new role` },
    ];
    const title = t`Create new role`;

    return (
      <React.Fragment>
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          title={title}
        ></BaseHeader>
        {notAuthorised ? (
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
                      isRequired={true}
                      key='name'
                      fieldId='name'
                      label={t`Name`}
                      style={{ width: '50%', float: 'left' }}
                      helperTextInvalid={
                        errorMessages['name'] || this.helperText(name)
                      }
                      validated={
                        this.toError(!('name' in errorMessages)) ||
                        this.checkLength(this.state.name)
                          ? 'error'
                          : null
                      }
                    >
                      <TextInput
                        id='role_name'
                        value={this.state.name}
                        onChange={(value) => {
                          this.setState({ name: value, errorMessages: {} });

                        }}
                        type='text'
                        validated={
                          this.toError(!('name' in errorMessages)) ||
                          this.checkLength(this.state.name)
                            ? 'error'
                            : null
                        }
                        placeholder='Role name'
                      />
                    </FormGroup>

                    <FormGroup
                      isRequired={true}
                      style={{ width: '50%' }}
                      key='description'
                      fieldId='description'
                      label={t`Description`}
                      helperTextInvalid={
                        this.helperText(description) ||
                        errorMessages['description']
                      }
                      validated={
                        this.toError(!('description' in errorMessages)) &&
                        this.checkLength(this.state.description)
                          ? 'error'
                          : null
                      }
                    >
                      <TextInput
                        id='role_description'
                        value={this.state.description}
                        onChange={(value) => {
                          this.setState({
                            description: value,
                            errorMessages: {},
                          });
                        }}
                        type='text'
                        validated={
                          this.toError(!('description' in errorMessages)) &&
                          this.checkLength(this.state.description)
                            ? 'error'
                            : null
                        }
                        placeholder='Add a role description here'
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
                      !name ||
                      descriptionError ||
                      nameError ||
                      this.checkLength(this.state.description) ||
                      this.checkLength(this.state.name)
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
                        nameError: null,
                        descriptionError: null,
                        redirect: Paths.roleList,
                      });
                    }}
                  >{t`Cancel`}</Button>
                  {saving ? <Spinner></Spinner> : null}
                </ActionGroup>
              </Form>
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private saveRole = () => {
    this.setState({ saving: true }, () => {
      const { name, permissions, description, errorMessages } = this.state;
      RoleAPI.create({ name, description, permissions })
        .then(() =>
          this.setState({ redirect: Paths.roleList, errorMessages: null }),
        )
        .catch((err) => {
          const { status, statusText } = err.response;

          if (status === 400) {
            const messages = this.mapErrors(err);

            this.setState(
              {
                errorMessages: messages,
                saving: false,
              },
              () => console.log('errorMEssages: ', this.state.errorMessages),
            );
          } else if (status === 404) {
            this.setState({
              alerts: this.state.alerts.concat({
                variant: 'danger',
                title: t`Changes to role "${this.state.name}" could not be saved.`,
                description: errorMessage(status, statusText),
              }),
              saving: false,
            });
          }
        });
    });
  };

  private mapErrors = (err) => {
    const messages = {};
    if (err.response.data.name) {
      messages['name'] = err.response.data.name[0];
    } else if (err.response.data.description !== undefined) {
      messages['description'] = err.response.data.description[0];
    }
    console.log('messages: ', messages);
    return messages;
  };



  private checkLength = (input) => {
    if (input.toString().length === 0 || input.toString().length > 128) {
      return true;
    } else {
      return false;
    }
  };

  private helperText = (input) => {
    let text = null;
    if (input === '') {
      text = t`This field may not be blank.`;
    } else if (input.toString().length > 128) {
      text = t`Ensure this field has no more than 128 characters.`;
    } else {
      text = null;
    }
    return text;
  };

  private toError(validated: boolean) {
    if (validated) {
      return 'default';
    } else {
      return 'error';
    }
  }
}

export default withRouter(RoleCreate);
RoleCreate.contextType = AppContext;
