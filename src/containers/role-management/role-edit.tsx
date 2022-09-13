import { t } from '@lingui/macro';

import * as React from 'react';
import {
  parsePulpIDFromURL,
  errorMessage,
  ErrorMessagesType,
  translateLockedRolesDescription,
} from 'src/utilities';
import {
  mapNetworkErrors,
  validateInput,
} from 'src/containers/role-management/map-role-errors';

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
          subTitle={translateLockedRolesDescription(
            role.name,
            role.description,
          )}
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
      </React.Fragment>
    );
  }

  private cancelRole = () => {
    this.setState({
      errorMessages: {},
      redirect: Paths.roleList,
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
        .then(() => this.setState({ redirect: Paths.roleList }))
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
