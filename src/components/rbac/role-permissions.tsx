import React, { useEffect, useState } from 'react';
import { RoleAPI } from 'src/api';
import { LoadingPageSpinner, PermissionCategories } from 'src/components';
import { translateLockedRole } from 'src/utilities';

interface IProps {
  name: string;
}

export const RolePermissions = ({ name }: IProps) => {
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
      <p>{translateLockedRole(role.name, role.description)}</p>
      <PermissionCategories
        permissions={role.permissions}
        showCustom
        showEmpty={false}
      />
    </>
  );
};
