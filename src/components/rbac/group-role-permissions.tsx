import { MessageDescriptor } from '@lingui/core';
import React, { useEffect, useState } from 'react';
import { RoleAPI } from 'src/api';
import { LoadingPageSpinner, RolePermissions } from 'src/components';
import { Constants } from 'src/constants';
import { translateLockedRolesDescription } from 'src/utilities';

interface IProps {
  name: string;
  filteredPermissions?: {
    [key: string]: MessageDescriptor;
  };
}

export const GroupRolePermissions = ({ name, filteredPermissions }: IProps) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    RoleAPI.list({ name }).then(({ data }) => {
      const [selectedRole] = data.results;
      setRole(selectedRole);
    });
  }, []);

  if (!role) {
    return <LoadingPageSpinner />;
  }

  if (!filteredPermissions) {
    filteredPermissions = { ...Constants.HUMAN_PERMISSIONS };
  }

  return (
    <>
      <p>{translateLockedRolesDescription(role.name, role.description)}</p>
      <RolePermissions
        filteredPermissions={filteredPermissions}
        selectedPermissions={role.permissions}
        showCustom={true}
        showEmpty={false}
      />
    </>
  );
};
