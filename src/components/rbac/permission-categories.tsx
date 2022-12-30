import * as React from 'react';
import { t } from '@lingui/macro';
import { AppContext } from 'src/loaders/app-context';
import { RoleType, GroupRoleType, ModelPermissionsType } from 'src/api';
import { PermissionChipSelector } from 'src/components';
import { Constants } from 'src/constants';
import { Flex, FlexItem } from '@patternfly/react-core';

interface IProps {
  role: RoleType | GroupRoleType;
  showCustom: boolean;
  showEmpty: boolean;
  showUserMgmt?: boolean;
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

export class PermissionCategories extends React.Component<IProps> {
  static contextType = AppContext;

  render() {
    const { role, showCustom, showEmpty, showUserMgmt } = this.props;
    const { model_permissions } = this.context.user;

    // show user/group permissions by default
    const allPermissions = Object.keys(model_permissions).filter(
      (permission) =>
        showUserMgmt !== false ||
        !Constants.USER_GROUP_MGMT_PERMISSIONS.includes(permission),
    );

    const groups = knownPermissionsAndCategories(
      model_permissions,
      allPermissions,
    );

    const allGroups = showCustom
      ? [
          ...groups,
          {
            label: t`Custom permissions`,
            allPermissions: role.permissions.filter(
              (permission) => !allPermissions.includes(permission),
            ),
          },
        ]
      : groups;

    const withActive = allGroups.map((group) => ({
      ...group,
      selectedPermissions: group.allPermissions.filter((permission) =>
        role.permissions.includes(permission),
      ),
      availablePermissions: group.allPermissions.filter(
        (permission) => !role.permissions.includes(permission),
      ),
    }));

    const groupsToShow = showEmpty
      ? withActive
      : withActive.filter((group) => group.selectedPermissions.length);

    return (
      <React.Fragment>
        {groupsToShow.length ? null : (
          <Flex
            style={{ marginTop: '16px' }}
            alignItems={{ default: 'alignItemsCenter' }}
            key={'no-permissions'}
            data-cy={'PermissionCategories-no-permissions'}
          >
            <FlexItem
              style={{ minWidth: '200px' }}
            >{t`No permissions`}</FlexItem>
            <FlexItem grow={{ default: 'grow' }}></FlexItem>
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
                menuAppendTo='inline'
                isViewOnly={true}
              />
            </FlexItem>
          </Flex>
        ))}
      </React.Fragment>
    );
  }
}
