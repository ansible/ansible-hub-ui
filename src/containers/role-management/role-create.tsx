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
  InputGroup,
  FormGroup,
  Title,
  Divider,
  Spinner,
} from '@patternfly/react-core';

import { twoWayMapper, errorMessage } from 'src/utilities';
import { Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { Constants } from 'src/constants';
import { RoleAPI } from 'src/api/role';

interface IState {
  saving: boolean;
  errorMessages: { string?: string };
  redirect?: string;
  permissions: string[];
  name: string;
  description: string;

  alerts: AlertType[];
}

class RoleCreate extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      saving: false,

      errorMessages: {},
      permissions: [],
      name: '',
      description: '',

      alerts: [],
    };
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }
    const {
      errorMessages,

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
                      helperTextInvalid={this.state.errorMessages['name']}
                      validated={errorMessages['name'] ? 'error' : null}
                    >
                      <InputGroup>
                        <TextInput
                          id='role_name'
                          value={name}
                          onChange={(value) => {
                            this.setState({ name: value }, () => {
                              this.validateInput(value, 'name');
                              console.log('errorsobject: ', errorMessages);
                            });
                          }}
                          type='text'
                          validated={errorMessages['name'] ? 'error' : null}
                          placeholder='Role name'
                        />
                      </InputGroup>
                    </FormGroup>

                    <FormGroup
                      isRequired={true}
                      style={{ width: '50%' }}
                      key='description'
                      fieldId='description'
                      label={t`Description`}
                      helperTextInvalid={
                        this.state.errorMessages['description']
                      }
                      validated={errorMessages['description'] ? 'error' : null}
                    >
                      <TextInput
                        id='role_description'
                        value={this.state.description}
                        onChange={(value) => {
                          this.setState({ description: value }, () => {
                            this.validateInput(value, 'description');
                          });
                        }}
                        type='text'
                        validated={
                          errorMessages['description'] ? 'error' : null
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
                      'description' in errorMessages || 'name' in errorMessages
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
                        errorMessages: {},
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
      const { name, permissions, description } = this.state;
      RoleAPI.create({ name, description, permissions })
        .then(() =>
          this.setState({ redirect: Paths.roleList, errorMessages: null }),
        )
        .catch((err) => {
          const { status, statusText } = err.response;

          if (status === 400) {
            this.mapErrors(err);

            this.setState({
              saving: false,
            });
          } else if (status === 404) {
            this.setState({
              errorMessages: {},
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
    const errors = this.state.errorMessages;

    if (err.response.data.name) {
      errors['name'] = err.response.data.name[0];
    } else if (err.response.data.description !== undefined) {
      errors['description'] = err.response.data.description[0];
    } else {
      delete errors['name'];
      delete errors['description'];
    }
  };

  private checkLength = (input) => {
    if (input.toString().length === 0 || input.toString().length > 128) {
      return true;
    } else {
      return false;
    }
  };

  private validateInput = (input, field) => {
    const error = this.state.errorMessages;
    if (input === '') {
      error[field] = t`This field may not be blank.`;
    } else if (input.toString().length > 128) {
      error[field] = t`Ensure this field has no more than 128 characters.`;
    } else if (field === 'name' && !/^[ a-zA-Z0-9_.]+$/.test(input)) {
      error[field] = t`This field can only contain letters and numbers`;
    } else if (input.length <= 2) {
      error[field] = t`This field must be longer than 2 characters`;
    } else if (field === 'name' && !input.startsWith('galaxy.')) {
      error[field] = t`This field must start with 'galaxy.'.`;
    } else {
      delete error[field];
    }
    // if (field === 'name') {
    //   this.setState({
    //     isNameValid: !('name' in error),
    //     errorMessages: error,
    //   });
    // } else if (field === 'description') {
    //   this.setState({
    //     isDescriptionValid: !('description' in error),
    //   });
    // }
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
