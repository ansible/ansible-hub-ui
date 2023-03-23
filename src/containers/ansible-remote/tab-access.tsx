import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import {
  AnsibleRemoteAPI,
  AnsibleRemoteType,
  GroupAPI,
  GroupType,
  RoleType,
} from 'src/api';
import { AccessTab } from 'src/components';
import { Paths, formatPath } from 'src/paths';

interface TabProps {
  item: AnsibleRemoteType;
  actionContext: { addAlert: (alert) => void; state: { params } };
}

export const RemoteAccessTab = ({ item, actionContext }: TabProps) => {
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

  const addGroup = (group, roles) => console.log('addGroup', group, roles);
  const addRole = (group, roles) => console.log('addRole', group, roles);
  const removeGroup = (group) => console.log('removeGroup', group);
  const removeRole = (role, group) => console.log('removeRole', role, group);
  const updateProps = (prop) => console.log('updateProps', prop);

  useEffect(() => {
    // AnsibleRemoteAPI.myPermissions(id);
    setGroups([]);
  }, []);

  return (
    <AccessTab
      addGroup={addGroup}
      addRole={addRole}
      canEditOwners={canEditOwners}
      group={selectedGroup}
      groups={groups}
      name={name}
      pulpObjectType='remotes/ansible/collection'
      removeGroup={removeGroup}
      removeRole={removeRole}
      selectRolesMessage={t`The selected roles will be added to this specific Ansible remote.`}
      showGroupRemoveModal={showGroupRemoveModal}
      showGroupSelectWizard={showGroupSelectWizard}
      showRoleRemoveModal={showRoleRemoveModal}
      showRoleSelectWizard={showRoleSelectWizard}
      updateProps={updateProps}
      urlPrefix={formatPath(Paths.ansibleRemotes, {
        name,
      })}
    />
  );
};
