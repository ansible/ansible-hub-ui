import { t } from '@lingui/macro';
import * as React from 'react';
import {
  ExecutionEnvironmentNamespaceAPI,
  GroupAPI,
  GroupType,
  RoleType,
} from 'src/api';
import { AccessTab } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatEEPath } from 'src/paths';
import { withRouter } from 'src/utilities';
import { ParamHelper, errorMessage } from 'src/utilities';
import {
  IDetailSharedProps,
  withContainerParamFix,
  withContainerRepo,
} from './base';
import './execution-environment-detail.scss';

interface IState {
  name: string;
  groups: GroupType[];
  canEditOwners: boolean;
  selectedGroup: GroupType;
  params: {
    group?: number;
  };
  showGroupRemoveModal?: GroupType;
  showGroupSelectWizard?: { group?: GroupType; roles?: RoleType[] };
  showRoleRemoveModal?: string;
  showRoleSelectWizard?: { roles?: RoleType[] };
}

class ExecutionEnvironmentDetailAccess extends React.Component<
  IDetailSharedProps,
  IState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(this.props.location.search);

    this.state = {
      name: props.containerRepository.name,
      groups: null, // loading
      canEditOwners: false,
      selectedGroup: null,
      params,
      showGroupRemoveModal: null,
      showGroupSelectWizard: null,
      showRoleRemoveModal: null,
      showRoleSelectWizard: null,
    };
  }

  componentDidMount() {
    this.queryNamespace(this.props.containerRepository.namespace);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const params = ParamHelper.parseParamString(this.props.location.search);

      if (!params['group']) {
        this.setState({
          selectedGroup: null,
        });
      }

      this.setState({ params }, () =>
        this.queryNamespace(this.props.containerRepository.namespace),
      );
    }
  }

  updateGroupRoles({ roles, alertSuccess, alertFailure, stateUpdate }) {
    Promise.all(roles)
      .then(() => {
        this.props.addAlert({
          title: alertSuccess,
          variant: 'success',
        });
        this.queryNamespace(this.props.containerRepository.namespace); // ensure reload() sets groups: null to trigger loading spinner
      })
      .catch(({ response: { status, statusText } }) => {
        this.props.addAlert({
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
    const { name, groups, canEditOwners, selectedGroup } = this.state;

    return (
      <AccessTab
        showGroupRemoveModal={this.state.showGroupRemoveModal}
        showGroupSelectWizard={this.state.showGroupSelectWizard}
        showRoleRemoveModal={this.state.showRoleRemoveModal}
        showRoleSelectWizard={this.state.showRoleSelectWizard}
        canEditOwners={canEditOwners}
        group={selectedGroup}
        groups={groups}
        name={name}
        pulpObjectType='pulp_container/namespaces'
        updateProps={(prop) => {
          this.setState(prop);
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
          this.updateGroupRoles({
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
          this.updateGroupRoles({
            roles,
            alertSuccess: t`Group "${group.name}" has been successfully removed from "${name}".`,
            alertFailure: t`Group "${group.name}" could not be removed from "${name}".`,
            stateUpdate: { showGroupRemoveModal: null },
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
          this.updateGroupRoles({
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
          this.updateGroupRoles({
            roles: [removedRole],
            alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
            alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
            stateUpdate: { showRoleRemoveModal: null },
          });
        }}
        selectRolesMessage={t`The selected roles will be added to this specific Execution Environment.`}
        urlPrefix={formatEEPath(Paths.executionEnvironmentDetailAccess, {
          container: name,
        })}
      />
    );
  }

  assignRolesToGroup(roles) {
    const groupRoles = [];
    for (const { groups, role } of roles) {
      for (const name of groups) {
        const groupIndex = groupRoles.findIndex((g) => g.name === name);
        if (groupIndex == -1) {
          groupRoles.push({ name, object_roles: [role] });
        } else {
          groupRoles[groupIndex].object_roles.push(role);
        }
      }
    }
    return groupRoles;
  }

  querySelectedGroup(name, groups) {
    GroupAPI.list({ name }).then(({ data: { data } }) => {
      this.setState({
        selectedGroup: groups.find((g) => g.name === data[0].name),
      });
    });
  }

  queryNamespace({ id, name: repoName }) {
    const { hasPermission } = this.context;
    ExecutionEnvironmentNamespaceAPI.myPermissions(id)
      .then(({ data: { permissions } }) => {
        ExecutionEnvironmentNamespaceAPI.listRoles(id)
          .then(({ data: { roles } }) => {
            const groupRoles = this.assignRolesToGroup(roles);

            this.setState({
              name: repoName,
              groups: groupRoles,
              canEditOwners:
                permissions.includes('container.change_containernamespace') ||
                hasPermission('container.change_containernamespace'),
            });

            if (this.state.params?.group) {
              this.querySelectedGroup(this.state.params.group, groupRoles);
            }
          })
          .catch(() => {
            this.setState({
              groups: [],
            });
          });
      })
      .catch(() => {
        this.setState({
          groups: [],
          canEditOwners: false,
        });
      });
  }
}

ExecutionEnvironmentDetailAccess.contextType = AppContext;

export default withRouter(
  withContainerParamFix(withContainerRepo(ExecutionEnvironmentDetailAccess)),
);
