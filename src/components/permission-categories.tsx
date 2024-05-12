import { t } from '@lingui/macro';
import { Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';
import { type ModelPermissionsType } from 'src/api';
import { PermissionChipSelector } from 'src/components';
import { useHubContext } from 'src/loaders/app-context';

interface IProps {
  permissions: string[];
  setSelected?: (permissions) => void;
  showCustom?: boolean;
  showEmpty?: boolean;
}

function knownPermissionsAndCategories(
  model_permissions: ModelPermissionsType,
  allPermissions: string[] = Object.keys(model_permissions),
): {
  label: string;
  allPermissions: string[];
  availablePermissions?: string[];
  selectedPermissions?: string[];
}[] {
  const categories = {};

  Object.entries(model_permissions)
    .filter(([k, _]) => allPermissions.includes(k))
    .forEach(([permission, { ui_category }]) => {
      categories[ui_category] ||= { label: ui_category, allPermissions: [] };
      categories[ui_category].allPermissions.push(permission);
    });

  return Object.values(categories);
}

export const PermissionCategories = ({
  permissions,
  setSelected,
  showCustom,
  showEmpty,
}: IProps) => {
  const { featureFlags, user } = useHubContext();
  const { model_permissions } = user;
  const showUserManagement = !featureFlags.external_authentication;

  // show user/group permissions by default
  const userManagementFilter = (permission) =>
    showUserManagement ||
    ![
      'galaxy.delete_user',
      'galaxy.add_user',
      'galaxy.change_user',
      'galaxy.delete_group',
      'galaxy.add_group',
    ].includes(permission);
  const allPermissions =
    Object.keys(model_permissions).filter(userManagementFilter);

  const groups = knownPermissionsAndCategories(
    model_permissions,
    allPermissions,
  );

  const allGroups = showCustom
    ? [
        ...groups,
        {
          label: t`Custom permissions`,
          allPermissions: permissions
            .filter(userManagementFilter)
            .filter((permission) => !allPermissions.includes(permission)),
        },
      ]
    : groups;

  const withActive = allGroups.map((group) => ({
    ...group,
    selectedPermissions: group.allPermissions.filter((permission) =>
      permissions?.includes(permission),
    ),
    availablePermissions: group.allPermissions.filter(
      (permission) => !permissions?.includes(permission),
    ),
  }));

  const groupsToShow = showEmpty
    ? withActive
    : withActive.filter((group) => group.selectedPermissions.length);

  return (
    <>
      {groupsToShow.length ? null : (
        <Flex
          style={{ marginTop: '16px' }}
          alignItems={{ default: 'alignItemsCenter' }}
          key={'no-permissions'}
          data-cy={'PermissionCategories-no-permissions'}
        >
          <FlexItem style={{ minWidth: '200px' }}>{t`No permissions`}</FlexItem>
          <FlexItem grow={{ default: 'grow' }} />
        </Flex>
      )}
      {groupsToShow.map((group) => (
        <Flex
          style={{ marginTop: '16px' }}
          alignItems={{ default: 'alignItemsCenter' }}
          key={group.label}
          data-cy={`PermissionCategories-${group.label}`}
        >
          <FlexItem style={{ minWidth: '200px' }}>{group.label}</FlexItem>
          <FlexItem grow={{ default: 'grow' }}>
            <PermissionChipSelector
              availablePermissions={group.availablePermissions}
              selectedPermissions={group.selectedPermissions}
              isViewOnly={!setSelected}
              onCategoryClear={() =>
                setSelected(
                  permissions?.filter(
                    (permission) => !group.allPermissions.includes(permission),
                  ),
                )
              }
              onPermissionToggle={(permission) => {
                const newPerms = new Set(permissions);

                if (newPerms.has(permission)) {
                  newPerms.delete(permission);
                } else {
                  newPerms.add(permission);
                }

                setSelected(Array.from(newPerms));
              }}
            />
          </FlexItem>
        </Flex>
      ))}
    </>
  );
};
