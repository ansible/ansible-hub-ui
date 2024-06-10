import { t } from '@lingui/macro';
import React from 'react';
import {
  ExecutionEnvironmentNamespaceAPI,
  GroupAPI,
  type GroupType,
  type RoleType,
  UserAPI,
} from 'src/api';
import { AccessTab } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatEEPath } from 'src/paths';
import { withRouter } from 'src/utilities';
import { ParamHelper, assignRoles, errorMessage } from 'src/utilities';
import {
  type IDetailSharedProps,
  withContainerParamFix,
  withContainerRepo,
} from './base';
import './execution-environment-detail.scss';

interface UserType {
  username: string;
  object_roles: string[];
}

interface IState {
  canEditOwners: boolean;
  groups: GroupType[];
  name: string;
  params: {
    group?: string;
    user?: string;
  };
  selectedGroup: GroupType;
  selectedUser: UserType;
  showGroupRemoveModal?: GroupType;
  showGroupSelectWizard?: { group?: GroupType; roles?: RoleType[] };
  showRoleRemoveModal?: string;
  showRoleSelectWizard?: { roles?: RoleType[] };
  showUserRemoveModal?: UserType;
  showUserSelectWizard?: { user?: UserType; roles?: RoleType[] };
  users: UserType[];
}

class ExecutionEnvironmentDetailAccess extends React.Component<
  IDetailSharedProps,
  IState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(
      this.props.location.search,
    ) as IState['params'];

    this.state = {
      canEditOwners: false,
      groups: null, // loading
      name: props.containerRepository.name,
      params,
      selectedGroup: null,
      selectedUser: null,
      showGroupRemoveModal: null,
      showGroupSelectWizard: null,
      showRoleRemoveModal: null,
      showRoleSelectWizard: null,
      showUserRemoveModal: null,
      showUserSelectWizard: null,
      users: null, // loading
    };
  }

  componentDidMount() {
    this.queryNamespace(this.props.containerRepository.namespace);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const params = ParamHelper.parseParamString(
        this.props.location.search,
      ) as IState['params'];

      if (!params.group) {
        this.setState({
          selectedGroup: null,
        });
      }
      if (!params.user) {
        this.setState({
          selectedUser: null,
        });
      }

      this.setState({ params }, () =>
        this.queryNamespace(this.props.containerRepository.namespace),
      );
    }
  }

  updateRoles({ roles, alertSuccess, alertFailure, stateUpdate }) {
    const {
      addAlert,
      containerRepository: { namespace },
    } = this.props;

    Promise.all(roles)
      .then(() => {
        addAlert({
          title: alertSuccess,
          variant: 'success',
        });

        // ensure reload() sets users/groups: null to trigger loading spinner
        this.queryNamespace(namespace);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: alertFailure,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      })
      .finally(() => {
        this.setState(stateUpdate);
      });
  }

  render() {
    const { canEditOwners, groups, name, selectedGroup, selectedUser, users } =
      this.state;

    return (
      <section className='body'>
        <AccessTab
          canEditOwners={canEditOwners}
          group={selectedGroup}
          groups={groups}
          name={name}
          pulpObjectType='pulp_container/namespaces'
          selectRolesMessage={t`The selected roles will be added to this specific Execution Environment.`}
          showGroupRemoveModal={this.state.showGroupRemoveModal}
          showGroupSelectWizard={this.state.showGroupSelectWizard}
          showRoleRemoveModal={this.state.showRoleRemoveModal}
          showRoleSelectWizard={this.state.showRoleSelectWizard}
          showUserRemoveModal={this.state.showUserRemoveModal}
          showUserSelectWizard={this.state.showUserSelectWizard}
          updateProps={(prop) => {
            this.setState(prop);
          }}
          urlPrefix={formatEEPath(Paths.executionEnvironmentDetailAccess, {
            container: name,
          })}
          user={selectedUser}
          users={users}
          addUser={(user, roles) => {
            const rolePromises = roles.map((role) =>
              ExecutionEnvironmentNamespaceAPI.addRole(
                this.props.containerRepository.namespace.id,
                {
                  role: role.name,
                  users: [user.username],
                },
              ),
            );
            this.updateRoles({
              roles: rolePromises,
              alertSuccess: t`User "${user.username}" has been successfully added to "${name}".`,
              alertFailure: t`User "${user.username}" could not be added to "${name}".`,
              stateUpdate: { showUserSelectWizard: null },
            });
          }}
          removeUser={(user) => {
            const roles = user.object_roles.map((role) =>
              ExecutionEnvironmentNamespaceAPI.removeRole(
                this.props.containerRepository.namespace.id,
                {
                  role,
                  users: [user.username],
                },
              ),
            );
            this.updateRoles({
              roles,
              alertSuccess: t`User "${user.username}" has been successfully removed from "${name}".`,
              alertFailure: t`User "${user.username}" could not be removed from "${name}".`,
              stateUpdate: { showUserRemoveModal: null },
            });
          }}
          addGroup={(group, roles) => {
            const rolePromises = roles.map((role) =>
              ExecutionEnvironmentNamespaceAPI.addRole(
                this.props.containerRepository.namespace.id,
                {
                  role: role.name,
                  groups: [group.name],
                },
              ),
            );
            this.updateRoles({
              roles: rolePromises,
              alertSuccess: t`Group "${group.name}" has been successfully added to "${name}".`,
              alertFailure: t`Group "${group.name}" could not be added to "${name}".`,
              stateUpdate: { showGroupSelectWizard: null },
            });
          }}
          removeGroup={(group) => {
            const roles = group.object_roles.map((role) =>
              ExecutionEnvironmentNamespaceAPI.removeRole(
                this.props.containerRepository.namespace.id,
                {
                  role,
                  groups: [group.name],
                },
              ),
            );
            this.updateRoles({
              roles,
              alertSuccess: t`Group "${group.name}" has been successfully removed from "${name}".`,
              alertFailure: t`Group "${group.name}" could not be removed from "${name}".`,
              stateUpdate: { showGroupRemoveModal: null },
            });
          }}
          addUserRole={(user, roles) => {
            const rolePromises = roles.map((role) =>
              ExecutionEnvironmentNamespaceAPI.addRole(
                this.props.containerRepository.namespace.id,
                {
                  role: role.name,
                  users: [user.username],
                },
              ),
            );
            this.updateRoles({
              roles: rolePromises,
              alertSuccess: t`User "${user.username}" roles successfully updated in "${name}".`,
              alertFailure: t`User "${user.username}" roles could not be update in "${name}".`,
              stateUpdate: { showRoleSelectWizard: null },
            });
          }}
          removeUserRole={(role, user) => {
            const removedRole = ExecutionEnvironmentNamespaceAPI.removeRole(
              this.props.containerRepository.namespace.id,
              {
                role,
                users: [user.username],
              },
            );
            this.updateRoles({
              roles: [removedRole],
              alertSuccess: t`User "${user.username}" roles successfully updated in "${name}".`,
              alertFailure: t`User "${user.username}" roles could not be update in "${name}".`,
              stateUpdate: { showRoleRemoveModal: null },
            });
          }}
          addRole={(group, roles) => {
            const rolePromises = roles.map((role) =>
              ExecutionEnvironmentNamespaceAPI.addRole(
                this.props.containerRepository.namespace.id,
                {
                  role: role.name,
                  groups: [group.name],
                },
              ),
            );
            this.updateRoles({
              roles: rolePromises,
              alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
              alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
              stateUpdate: { showRoleSelectWizard: null },
            });
          }}
          removeRole={(role, group) => {
            const removedRole = ExecutionEnvironmentNamespaceAPI.removeRole(
              this.props.containerRepository.namespace.id,
              {
                role,
                groups: [group.name],
              },
            );
            this.updateRoles({
              roles: [removedRole],
              alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
              alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
              stateUpdate: { showRoleRemoveModal: null },
            });
          }}
        />
      </section>
    );
  }

  querySelectedUser(username, users) {
    UserAPI.list({ username }).then(({ data: { data } }) => {
      this.setState({
        selectedUser: users.find((u) => u.username === data[0].username),
      });
    });
  }

  querySelectedGroup(name, groups) {
    GroupAPI.list({ name }).then(({ data: { data } }) => {
      this.setState({
        selectedGroup: groups.find((g) => g.name === data[0].name),
      });
    });
  }

  queryNamespace({ id, name }) {
    const { hasPermission } = this.context;
    Promise.all([
      ExecutionEnvironmentNamespaceAPI.myPermissions(id).then(
        ({ data: { permissions } }) => permissions,
      ),
      // TODO handle pagination
      ExecutionEnvironmentNamespaceAPI.listRoles(id, { page_size: 100 }).then(
        ({ data: { roles } }) => roles,
      ),
    ])
      .then(([permissions, roles]) => {
        const { users, groups } = assignRoles(roles) as {
          users: UserType[];
          groups: GroupType[];
        };

        this.setState({
          name,
          canEditOwners:
            permissions.includes('container.change_containernamespace') ||
            hasPermission('container.change_containernamespace'),
          groups,
          users,
        });

        if (this.state.params?.user) {
          this.querySelectedUser(this.state.params.user, users);
        }
        if (this.state.params?.group) {
          this.querySelectedGroup(this.state.params.group, groups);
        }
      })
      .catch(() => {
        this.setState({
          canEditOwners: false,
          groups: [],
          users: [],
        });
      });
  }
}

ExecutionEnvironmentDetailAccess.contextType = AppContext;

export default withRouter(
  withContainerParamFix(withContainerRepo(ExecutionEnvironmentDetailAccess)),
);
