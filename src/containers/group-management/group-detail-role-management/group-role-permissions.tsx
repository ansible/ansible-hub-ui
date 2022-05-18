import React, { useEffect, useState } from 'react';

import { RolePermissions, LoadingPageSpinner } from 'src/components';

import { RoleAPI } from 'src/api';

interface IProps {
  name: string;
  filteredPermissions: {
    [key: string]: string;
  };
}

const GroupRolePermissions = ({ name, filteredPermissions }: IProps) => {
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

export default GroupRolePermissions;
