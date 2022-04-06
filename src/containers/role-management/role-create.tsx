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
} from '@patternfly/react-core';

import {
  twoWayMapper,
  mapErrorMessages,
  ErrorMessagesType,
} from 'src/utilities';
import { Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { Constants } from 'src/constants';
import { RoleAPI } from 'src/api/role';

interface IState {
  errorMessages: ErrorMessagesType;
  redirect?: string;
  permissions: string[];
  name: string;
  description: string;
  roleError: ErrorMessagesType;
}

class RoleCreate extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      errorMessages: {},
      permissions: [],
      name: '',
      description: '',
      roleError: null,
    };
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const groups = Constants.PERMISSIONS;
    const { permissions: selectedPermissions, name } = this.state;

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

    const notAuthorised =
      !this.context.user || !this.context.user.model_permissions.add_user;
    const breadcrumbs = [
      { url: Paths.roleList, name: t`Roles` },
      { name: t`Create new role` },
    ];
    const title = t`Create new role`;

    return notAuthorised ? (
      <React.Fragment>
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          title={title}
        ></BaseHeader>
        <EmptyStateUnauthorized />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          title={title}
        ></BaseHeader>
        <Main>
          <section className='body'>
            <div>
              <div style={{ paddingBottom: '8px', paddingTop: '16px' }}>
                <Title headingLevel='h2'>Details</Title>
              </div>
              <FormGroup
                isRequired={true}
                key='name'
                fieldId='name'
                label={t`Name`}
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
                />
              </FormGroup>

              <FormGroup
                isRequired={false}
                key='description'
                fieldId='description'
                label={t`Description`}
                helperTextInvalid={
                  !this.state.roleError ? null : this.state.roleError.name
                }
              >
                <TextInput
                  id='role_description'
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
  private saveRole = () => {
    const { name, permissions, description } = this.state;
    RoleAPI.create({ name, description, permissions })
      .then(() => this.setState({ redirect: Paths.roleList }))
      .catch((err) => {
        this.setState({ roleError: mapErrorMessages(err) });
        console.log('roleError: ', this.state.roleError);
      });
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
