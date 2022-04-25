import { t } from '@lingui/macro';
import { errorMessage } from 'src/utilities';
import { mapNetworkErrors, validateInput } from 'src/utilities/map-role-errors';
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
                    const errors = validateInput(
                      value,
                      'name',
                      this.state.errorMessages,
                    );
                    this.setState({ errorMessages: errors });
                  });
                }}
                description={description}
                descriptionValidated={
                  errorMessages['description'] ? 'error' : null
                }
                descriptionHelperText={errorMessages['description']}
                onDescriptionChange={(value) => {
                  this.setState({ description: value }, () => {
                    const errors = validateInput(
                      value,
                      'description',
                      this.state.errorMessages,
                    );
                    this.setState({ errorMessages: errors });
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
            const errors = mapNetworkErrors(err);

            this.setState({
              saving: false,
              errorMessages: errors,
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
}

export default withRouter(RoleCreate);
RoleCreate.contextType = AppContext;
