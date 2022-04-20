import { t } from '@lingui/macro';
// import { i18n } from '@lingui/core';

import * as React from 'react';
import {
  parsePulpIDFromURL,
  errorMessage,
  ErrorMessagesType,
} from 'src/utilities';

import { RoleAPI } from 'src/api/role';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import {
  AlertList,
  AlertType,
  closeAlertMixin,
  EmptyStateUnauthorized,
  LoadingPageWithHeader,
  Main,
  RoleForm,
  RoleHeader,
} from 'src/components';

import { Paths } from 'src/paths';

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

  showDeleteModal: boolean;
  saving: boolean;
  permissions: string[];
  originalPermissions: string[];
  redirect?: string;
  unauthorised: boolean;
  inputText: string;
  name: string;
  description: string;
  roleError: ErrorMessagesType;
  nameError: boolean;
  errorMessages: { [key: string]: string };
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
      showDeleteModal: false,
      nameError: false,
      permissions: [],
      originalPermissions: [],
      unauthorised: false,
      inputText: '',
      name: null,
      description: null,
      errorMessages: {},
      saving: false,
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
            originalPermissions: result.data.permissions,
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
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const {
      name,

      description,
      alerts,
      editPermissions,
      role,
      errorMessages,
      unauthorised,
      saving,
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

    if (!role) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      { url: Paths.roleList, name: t`Roles` },
      { name: role.name },
    ];

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <RoleHeader
          title={editPermissions ? t`Edit role permissions` : role.name}
          subTitle={role.description}
          breadcrumbs={breadcrumbs}
        />
        {unauthorised ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              <RoleForm
                {...this.state}
                name={name}
                nameDisabled={true}
                description={description}
                descriptionHelperText={errorMessages['description']}
                descriptionValidated={
                  errorMessages['description'] ? 'error' : null
                }
                onDescriptionChange={(value) => {
                  this.setState({ description: value }, () => {
                    this.validateInput(value, 'description');
                  });
                }}
                // originalPermissions={originalPermissions}
                saving={saving}
                saveRole={this.editRole}
                isSavingDisabled={
                  'description' in errorMessages || 'name' in errorMessages
                }
                cancelRole={this.cancelRole}
              />
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private checkLength = (input) => {
    if (input.toString().length > 128 || input.toString().length === 0) {
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

  private validateInput = (input, field) => {
    const error = { ...this.state.errorMessages };
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

    this.setState({
      errorMessages: error,
    });
  };

  private cancelRole = () => {
    this.setState({
      errorMessages: {},
      redirect: Paths.roleList,
    });
  };

  private mapErrors = (err) => {
    const errors = { ...err.response.data };
    for (const field in errors) {
      errors[field] = errors[field].toString().split(',').join(' ');
    }
    this.setState({ errorMessages: errors });
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

  private editRole = (permissions) => {
    this.setState({ saving: true }, () => {
      const { pulp_href } = this.state.role;
      const roleID = parsePulpIDFromURL(pulp_href) + '/';
      const { name, description } = this.state;

      RoleAPI.updatePermissions(roleID, { name, description, permissions })
        .then(() => this.setState({ redirect: Paths.roleList }))
        .catch((err) => {
          const { status, statusText } = err.response;
          if (err.response.status === 400) {
            this.mapErrors(err);
            this.setState({ saving: false });
          } else if (status === 404) {
            this.setState({
              errorMessages: {},
              alerts: this.state.alerts.concat({
                variant: 'danger',
                title: t`Changes to role "${name}" could not be saved.`,
                description: errorMessage(status, statusText),
              }),
              saving: false,
            });
          }
        });
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
