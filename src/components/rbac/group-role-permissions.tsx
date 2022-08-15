import React, { useEffect, useState } from 'react';

import { RoleAPI } from 'src/api';
import { Constants } from 'src/constants';
import { RolePermissions, LoadingPageSpinner } from 'src/components';

interface IProps {
  name: string;
  filteredPermissions?: {
    [key: string]: string;
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
      <p>{role.description}</p>
      <RolePermissions
        filteredPermissions={filteredPermissions}
        selectedPermissions={role.permissions}
        showCustom={true}
        showEmpty={false}
      />
    </>
  );
};
