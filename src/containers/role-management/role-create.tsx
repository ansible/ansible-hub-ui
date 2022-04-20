import { t } from '@lingui/macro';
import { errorMessage } from 'src/utilities';
import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import './role.scss';

import {
  RoleForm,
  RoleHeader,
  AlertType,
  EmptyStateUnauthorized,
  Main,
} from 'src/components';

import { Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { Constants } from 'src/constants';
import { RoleAPI } from 'src/api/role';

interface IState {
  saving: boolean;
  errorMessages: { [key: string]: string };
  redirect?: string;
  permissions: string[];
  name: string;
  description: string;
  nameHelperText: string;
  nameValidated: string;
  alerts: AlertType[];
}

class RoleCreate extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      saving: false,
      nameValidated: '',
      nameHelperText: '',
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

    const { errorMessages, description, name, saving } = this.state;

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

    return (
      <React.Fragment>
        <RoleHeader title={t`Create a new role`} breadcrumbs={breadcrumbs} />
        {notAuthorised ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              <RoleForm
                nameValidated={errorMessages['name'] ? 'error' : null}
                nameHelperText={errorMessages['name']}
                name={name}
                onNameChange={(value) => {
                  this.setState({ name: value }, () => {
                    this.validateInput(value, 'name');
                  });
                }}
                description={description}
                descriptionValidated={
                  errorMessages['description'] ? 'error' : null
                }
                descriptionHelperText={errorMessages['description']}
                onDescriptionChange={(value) => {
                  this.setState({ description: value }, () => {
                    this.validateInput(value, 'description');
                  });
                }}
                saveRole={this.createRole}
                isSavingDisabled={
                  'description' in errorMessages || 'name' in errorMessages
                }
                cancelRole={this.cancelRole}
                saving={saving}
              />
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

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

  private createRole = (permissions) => {
    this.setState({ saving: true }, () => {
      const { name, description } = this.state;

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
                title: t`Role "${this.state.name}" could not be created.`,
                description: errorMessage(status, statusText),
              }),
              saving: false,
            });
          }
        });
    });
  };

  private mapErrors = (err) => {
    const errors = { ...err.response.data };
    for (const field in errors) {
      errors[field] = errors[field].toString().split(',').join(' ');
    }
    this.setState({ errorMessages: errors });
  };
}

export default withRouter(RoleCreate);
RoleCreate.contextType = AppContext;
