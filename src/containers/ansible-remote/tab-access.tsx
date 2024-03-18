import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import {
  AnsibleRemoteAPI,
  type AnsibleRemoteType,
  GroupAPI,
  type GroupType,
  type RoleType,
  UserAPI,
} from 'src/api';
import { AccessTab } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canEditAnsibleRemoteAccess } from 'src/permissions';
import { assignRoles, errorMessage, parsePulpIDFromURL } from 'src/utilities';

interface UserType {
  username: string;
  object_roles: string[];
}

interface TabProps {
  item: AnsibleRemoteType;
  actionContext: {
    addAlert: (alert) => void;
    featureFlags;
    hasPermission;
    state: { params };
    user;
  };
}

export const RemoteAccessTab = ({
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
  const [users, setUsers] = useState<UserType[]>(null); // loading
  const [canEditOwners, setCanEditOwners] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupType>(null);
  const [selectedUser, setSelectedUser] = useState<UserType>(null);
  const [showUserRemoveModal, setShowUserRemoveModal] =
    useState<UserType>(null);
  const [showUserSelectWizard, setShowUserSelectWizard] = useState<{
    user?: UserType;
    roles?: RoleType[];
  }>(null);
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
    setUsers(null);
    setGroups(null);

    AnsibleRemoteAPI.myPermissions(id)
      .then(({ data: { permissions } }) => {
        setCanEditOwners(
          canEditAnsibleRemoteAccess({
            hasPermission,
            hasObjectPermission: (p: string): boolean =>
              permissions.includes(p),
            user,
            featureFlags,
          }),
        );
        // TODO handle pagination
        AnsibleRemoteAPI.listRoles(id, { page_size: 100 })
          .then(({ data: { roles } }) => {
            const { users, groups } = assignRoles(roles);

            setName(name);
            setUsers(users as UserType[]);
            setGroups(groups as GroupType[]);
          })
          .catch(() => {
            setUsers([]);
            setGroups([]);
          });
      })
      .catch(() => {
        setUsers([]);
        setGroups([]);
        setCanEditOwners(false);
      });
  };

  const updateRoles = ({ roles, alertSuccess, alertFailure, stateUpdate }) => {
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

  const addUser = (user, roles) => {
    const rolePromises = roles.map((role) =>
      AnsibleRemoteAPI.addRole(id, {
        role: role.name,
        users: [user.username],
      }),
    );
    updateRoles({
      roles: rolePromises,
      alertSuccess: t`User "${user.username}" has been successfully added to "${name}".`,
      alertFailure: t`User "${user.username}" could not be added to "${name}".`,
      stateUpdate: { showUserSelectWizard: null },
    });
  };

  const removeUser = (user) => {
    const roles = user.object_roles.map((role) =>
      AnsibleRemoteAPI.removeRole(id, {
        role,
        users: [user.username],
      }),
    );
    updateRoles({
      roles,
      alertSuccess: t`User "${user.username}" has been successfully removed from "${name}".`,
      alertFailure: t`User "${user.username}" could not be removed from "${name}".`,
      stateUpdate: { showUserRemoveModal: null },
    });
  };

  const addGroup = (group, roles) => {
    const rolePromises = roles.map((role) =>
      AnsibleRemoteAPI.addRole(id, {
        role: role.name,
        groups: [group.name],
      }),
    );
    updateRoles({
      roles: rolePromises,
      alertSuccess: t`Group "${group.name}" has been successfully added to "${name}".`,
      alertFailure: t`Group "${group.name}" could not be added to "${name}".`,
      stateUpdate: { showGroupSelectWizard: null },
    });
  };

  const removeGroup = (group) => {
    const roles = group.object_roles.map((role) =>
      AnsibleRemoteAPI.removeRole(id, {
        role,
        groups: [group.name],
      }),
    );
    updateRoles({
      roles,
      alertSuccess: t`Group "${group.name}" has been successfully removed from "${name}".`,
      alertFailure: t`Group "${group.name}" could not be removed from "${name}".`,
      stateUpdate: { showGroupRemoveModal: null },
    });
  };

  const addUserRole = (user, roles) => {
    const rolePromises = roles.map((role) =>
      AnsibleRemoteAPI.addRole(id, {
        role: role.name,
        users: [user.username],
      }),
    );
    updateRoles({
      roles: rolePromises,
      alertSuccess: t`User "${user.username}" roles successfully updated in "${name}".`,
      alertFailure: t`User "${user.username}" roles could not be update in "${name}".`,
      stateUpdate: { showRoleSelectWizard: null },
    });
  };

  const removeUserRole = (role, user) => {
    const removedRole = AnsibleRemoteAPI.removeRole(id, {
      role,
      users: [user.username],
    });
    updateRoles({
      roles: [removedRole],
      alertSuccess: t`User "${user.username}" roles successfully updated in "${name}".`,
      alertFailure: t`User "${user.username}" roles could not be update in "${name}".`,
      stateUpdate: { showRoleRemoveModal: null },
    });
  };

  const addRole = (group, roles) => {
    const rolePromises = roles.map((role) =>
      AnsibleRemoteAPI.addRole(id, {
        role: role.name,
        groups: [group.name],
      }),
    );
    updateRoles({
      roles: rolePromises,
      alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
      alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
      stateUpdate: { showRoleSelectWizard: null },
    });
  };

  const removeRole = (role, group) => {
    const removedRole = AnsibleRemoteAPI.removeRole(id, {
      role,
      groups: [group.name],
    });
    updateRoles({
      roles: [removedRole],
      alertSuccess: t`Group "${group.name}" roles successfully updated in "${name}".`,
      alertFailure: t`Group "${group.name}" roles could not be update in "${name}".`,
      stateUpdate: { showRoleRemoveModal: null },
    });
  };

  const updateProps = (props) => {
    Object.entries(props).forEach(([k, v]) => {
      switch (k) {
        case 'showUserRemoveModal':
          setShowUserRemoveModal(v as UserType);
          break;
        case 'showUserSelectWizard':
          setShowUserSelectWizard(v as { user?: UserType; roles?: RoleType[] });
          break;
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
    if (!users) {
      return;
    }

    if (!params?.user) {
      setSelectedUser(null);
      return;
    }

    UserAPI.list({ username: params.user }).then(({ data: { data } }) => {
      setSelectedUser(users.find((u) => u.username === data[0].username));
    });
  }, [params?.user, users]);

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
      addUser={addUser}
      addUserRole={addUserRole}
      canEditOwners={canEditOwners}
      group={selectedGroup}
      groups={groups}
      name={name}
      pulpObjectType='remotes/ansible/collection'
      removeGroup={removeGroup}
      removeRole={removeRole}
      removeUser={removeUser}
      removeUserRole={removeUserRole}
      selectRolesMessage={t`The selected roles will be added to this specific Ansible remote.`}
      showGroupRemoveModal={showGroupRemoveModal}
      showGroupSelectWizard={showGroupSelectWizard}
      showRoleRemoveModal={showRoleRemoveModal}
      showRoleSelectWizard={showRoleSelectWizard}
      showUserRemoveModal={showUserRemoveModal}
      showUserSelectWizard={showUserSelectWizard}
      updateProps={updateProps}
      user={selectedUser}
      users={users}
      urlPrefix={formatPath(Paths.ansibleRemoteDetail, {
        name,
      })}
    />
  );
};
