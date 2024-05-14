import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { RoleAPI, type RoleType } from 'src/api';
import {
  AlertList,
  type AlertType,
  EmptyStateUnauthorized,
  LoadingPage,
  Main,
  RoleForm,
  RoleHeader,
  closeAlert,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  type ErrorMessagesType,
  type RouteProps,
  jsxErrorMessage,
  mapNetworkErrors,
  parsePulpIDFromURL,
  translateLockedRole,
  validateInput,
  withRouter,
} from 'src/utilities';

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
  unauthorized: boolean;
  inputText: string;
  name: string;
  description: string;
  roleError: ErrorMessagesType;
  nameError: boolean;
  errorMessages: Record<string, string>;
}

class EditRole extends Component<RouteProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    const id = this.props.routeParams.role;

    this.state = {
      role: null,

      params: {
        id,
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
      unauthorized: false,
      inputText: '',
      name: null,
      description: null,
      errorMessages: {},
      saving: false,
    };
  }

  componentDidMount() {
    this.setState({ editPermissions: true });
    if (
      !(this.context as IAppContextType).user ||
      (this.context as IAppContextType).user.is_anonymous
    ) {
      this.setState({ unauthorized: true });
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
          this.setState({ redirect: formatPath(Paths.notFound) });
          this.addAlert(
            t`Role "${this.state.role.name}" could not be displayed.`,
            'danger',
            jsxErrorMessage(status, statusText),
          );
        });
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const {
      name,

      description,
      alerts,
      editPermissions,
      role,
      errorMessages,
      unauthorized,
      saving,
    } = this.state;

    if (!role && alerts && alerts.length) {
      return (
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
      );
    }

    if (!role) {
      return <LoadingPage />;
    }

    const breadcrumbs = [
      { url: formatPath(Paths.roleList), name: t`Roles` },
      { name: role.name },
    ];

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        <RoleHeader
          title={editPermissions ? t`Edit role permissions` : role.name}
          subTitle={translateLockedRole(role.name, role.description)}
          breadcrumbs={breadcrumbs}
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              <RoleForm
                {...this.state}
                name={name}
                nameDisabled
                description={description}
                descriptionHelperText={errorMessages['description']}
                descriptionValidated={
                  errorMessages['description'] ? 'error' : null
                }
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
      </>
    );
  }

  private cancelRole = () => {
    this.setState({
      errorMessages: {},
      redirect: formatPath(Paths.roleList),
    });
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
        .then(() => this.setState({ redirect: formatPath(Paths.roleList) }))
        .catch((err) => {
          const { status, statusText } = err.response;
          if (err.response.status === 400) {
            const errors = mapNetworkErrors(err);

            this.setState({ saving: false, errorMessages: errors });
          } else if (status === 404) {
            this.setState({
              errorMessages: {},
              alerts: this.state.alerts.concat({
                variant: 'danger',
                title: t`Changes to role "${name}" could not be saved.`,
                description: jsxErrorMessage(status, statusText),
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
}

export default withRouter(EditRole);
