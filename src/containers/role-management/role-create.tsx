import { t } from '@lingui/core/macro';
import { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { RoleAPI } from 'src/api';
import {
  type AlertType,
  EmptyStateUnauthorized,
  Main,
  RoleForm,
  RoleHeader,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  type RouteProps,
  jsxErrorMessage,
  mapNetworkErrors,
  validateInput,
  withRouter,
} from 'src/utilities';

interface IState {
  saving: boolean;
  errorMessages: Record<string, string>;
  redirect?: string;
  permissions: string[];
  name: string;
  description: string;
  nameHelperText: string;
  nameValidated: string;
  alerts: AlertType[];
}

class RoleCreate extends Component<RouteProps, IState> {
  static contextType = AppContext;

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
      return <Navigate to={this.state.redirect} />;
    }

    const { errorMessages, description, name, saving } = this.state;

    const notAuthorised =
      !(this.context as IAppContextType).user ||
      (this.context as IAppContextType).user.is_anonymous;
    const breadcrumbs = [
      { url: formatPath(Paths.roleList), name: t`Roles` },
      { name: t`Create new role` },
    ];

    return (
      <>
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
      </>
    );
  }

  private cancelRole = () => {
    this.setState({
      errorMessages: {},
      redirect: formatPath(Paths.roleList),
    });
  };

  private createRole = (permissions) => {
    this.setState({ saving: true }, () => {
      const { name, description } = this.state;

      RoleAPI.create({ name, description, permissions })
        .then(() =>
          this.setState({
            redirect: formatPath(Paths.roleList),
            errorMessages: null,
          }),
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
                description: jsxErrorMessage(status, statusText),
              }),
              saving: false,
            });
          }
        });
    });
  };
}

export default withRouter(RoleCreate);
