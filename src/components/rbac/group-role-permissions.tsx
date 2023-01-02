import React, { useEffect, useState } from 'react';

import { RoleAPI } from 'src/api';
import { PermissionCategories, LoadingPageSpinner } from 'src/components';
import { translateLockedRolesDescription } from 'src/utilities';

interface IProps {
  name: string;
}

export const GroupRolePermissions = ({ name }: IProps) => {
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

  return (
    <>
      <p>{translateLockedRolesDescription(role.name, role.description)}</p>
      <PermissionCategories
        permissions={role.permissions}
        showCustom={true}
        showEmpty={false}
      />
    </>
  );
};
