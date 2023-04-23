import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  GroupAPI,
  GroupType,
  RoleType,
} from 'src/api';
import { AccessTab } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canEditAnsibleRepositoryAccess } from 'src/permissions';
import { errorMessage, parsePulpIDFromURL } from 'src/utilities';

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: {
    addAlert: (alert) => void;
    featureFlags;
    hasPermission;
    state: { params };
    user;
  };
}

export const RepositoryAccessTab = ({
  item,
  actionContext: {
    addAlert,
    featureFlags,
    hasPermission,
    state: { params },
    user,
  },
}: TabProps) => {
  const id = item?.pulp_href && parsePulpIDFromURL(item.pulp_href);
  const [name, setName] = useState<string>(item?.name);
  const [groups, setGroups] = useState<GroupType[]>(null); // loading
  const [canEditOwners, setCanEditOwners] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupType>(null);
  const [showGroupRemoveModal, setShowGroupRemoveModal] =
    useState<GroupType>(null);
  const [showGroupSelectWizard, setShowGroupSelectWizard] = useState<{
    group?: GroupType;
    roles?: RoleType[];
  }>(null);
  const [showRoleRemoveModal, setShowRoleRemoveModal] = useState<string>(null);
  const [showRoleSelectWizard, setShowRoleSelectWizard] = useState<{
    roles?: RoleType[];
  }>(null);

  const query = () => {
    setGroups(null);
    AnsibleRepositoryAPI.myPermissions(id)
      .then(({ data: { permissions } }) => {
        setCanEditOwners(
          canEditAnsibleRepositoryAccess({
            hasPermission,
            hasObjectPermission: (p: string): boolean =>
              permissions.includes(p),
            user,
            featureFlags,
          }),
        );
        AnsibleRepositoryAPI.listRoles(id)
          .then(({ data: { roles } }) => {
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

            setName(name);
            setGroups(groupRoles);
          })
          .catch(() => {
            setGroups([]);
          });
      })
      .catch(() => {
        setGroups([]);
        setCanEditOwners(false);
      });
  };

  const updateGroupRoles = ({
    roles,
    alertSuccess,
    alertFailure,
    stateUpdate,
  }) => {
    Promise.all(roles)
      .then(() => {
        addAlert({
          title: alertSuccess,
          variant: 'success',
        });
        query();
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: alertFailure,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      })
      .finally(() => {
        updateProps(stateUpdate);
      });
  };

  const addGroup = (group, roles) => {
    const rolePromises = roles.map((role) =>
      AnsibleRepositoryAPI.addRole(id, {
        role: role.name,
        groups: [group.name],
      }),
    );
    updateGroupRoles({
      roles: rolePromises,
      alertSuccess: t`Group "${group.name}" has been successfully added to "${name}".`,
      alertFailure: t`Group "${group.name}" could not be added to "${name}".`,
      stateUpdate: { showGroupSelectWizard: null },
    });
  };

  const removeGroup = (group) => {
    const roles = group.object_roles.map((role) =>
      AnsibleRepositoryAPI.removeRole(id, {
        role,
        groups: [group.name],
      }),
    );
    updateGroupRoles({
      roles,
      alertSuccess: t`Group "${group.name}" has been successfully removed from "${name}".`,
      alertFailure: t`Group "${group.name}" could not be removed from "${name}".`,
      stateUpdate: { showGroupRemoveModal: null },
    });
  };
  const addRole = (group, roles) => {
    const rolePromises = roles.map((role) =>
      AnsibleRepositoryAPI.addRole(id, {
        role: role.name,
        groups: [group.name],
      }),
    );
    updateGroupRoles({
      roles: rolePromises,
      alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
      alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
      stateUpdate: { showRoleSelectWizard: null },
    });
  };
  const removeRole = (role, group) => {
    const removedRole = AnsibleRepositoryAPI.removeRole(id, {
      role,
      groups: [group.name],
    });
    updateGroupRoles({
      roles: [removedRole],
      alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
      alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
      stateUpdate: { showRoleRemoveModal: null },
    });
  };

  const updateProps = (props) => {
    Object.entries(props).forEach(([k, v]) => {
      switch (k) {
        case 'showGroupRemoveModal':
          setShowGroupRemoveModal(v as GroupType);
          break;
        case 'showGroupSelectWizard':
          setShowGroupSelectWizard(
            v as { group?: GroupType; roles?: RoleType[] },
          );
          break;
        case 'showRoleRemoveModal':
          setShowRoleRemoveModal(v as string);
          break;
        case 'showRoleSelectWizard':
          setShowRoleSelectWizard(v as { roles?: RoleType[] });
          break;
        default:
          console.error('updateProps', k, v);
      }
    });
  };

  useEffect(query, [item.pulp_href]);
  useEffect(() => {
    if (!groups) {
      return;
    }

    if (!params?.group) {
      setSelectedGroup(null);
      return;
    }

    GroupAPI.list({ name: params.group }).then(({ data: { data } }) => {
      setSelectedGroup(groups.find((g) => g.name === data[0].name));
    });
  }, [params?.group, groups]);

  return (
    <AccessTab
      addGroup={addGroup}
      addRole={addRole}
      canEditOwners={canEditOwners}
      group={selectedGroup}
      groups={groups}
      name={name}
      pulpObjectType='repositories/ansible/ansible'
      removeGroup={removeGroup}
      removeRole={removeRole}
      selectRolesMessage={t`The selected roles will be added to this specific Ansible repository.`}
      showGroupRemoveModal={showGroupRemoveModal}
      showGroupSelectWizard={showGroupSelectWizard}
      showRoleRemoveModal={showRoleRemoveModal}
      showRoleSelectWizard={showRoleSelectWizard}
      updateProps={updateProps}
      urlPrefix={formatPath(Paths.ansibleRepositoryDetail, {
        name,
      })}
    />
  );
};
