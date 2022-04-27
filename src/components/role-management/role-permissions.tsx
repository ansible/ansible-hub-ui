import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';
import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { PermissionChipSelector } from 'src/components';
import { RoleType } from 'src/api';
import { twoWayMapper } from 'src/utilities';

interface IProps {
  filteredPermissions: { [key: string]: string };
  role: RoleType;
}

export const RolePermissions: React.FC<IProps> = ({
  filteredPermissions,
  role,
}) => {
  const groups = Constants.PERMISSIONS;

  const getSelectedRoles = (role, group) =>
    role.permissions
      .filter((selected) =>
        group.object_permissions.find((perm) => selected === perm),
      )
      .map((value) => twoWayMapper(value, filteredPermissions));

  const getCustomPermissions = (role) =>
    role.permissions.filter(
      (perm) => !Object.keys(filteredPermissions).includes(perm),
    );

  return (
    <>
      {groups.map((group, i) => (
        <React.Fragment key={i}>
          {getSelectedRoles(role, group).length !== 0 && (
            <Flex
              style={{ marginTop: '16px' }}
              alignItems={{ default: 'alignItemsCenter' }}
              key={group.name}
              className={group.name}
            >
              {role.permissions.length !== 0 && (
                <>
                  <FlexItem style={{ minWidth: '200px' }}>
                    {i18n._(group.label)}
                  </FlexItem>
                  <FlexItem grow={{ default: 'grow' }}>
                    <PermissionChipSelector
                      availablePermissions={group.object_permissions
                        .filter(
                          (perm) =>
                            !role.permissions.find(
                              (selected) => selected === perm,
                            ),
                        )
                        .map((value) =>
                          twoWayMapper(value, filteredPermissions),
                        )
                        .sort()}
                      selectedPermissions={getSelectedRoles(role, group)}
                      menuAppendTo='inline'
                      multilingual={true}
                      isViewOnly={true}
                    />
                  </FlexItem>
                </>
              )}
            </Flex>
          )}
        </React.Fragment>
      ))}

      {getCustomPermissions(role).length !== 0 && (
        <Flex
          style={{ marginTop: '16px' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem style={{ minWidth: '200px' }}>
            {t`Custom permissions`}
          </FlexItem>
          <FlexItem grow={{ default: 'grow' }}>
            <PermissionChipSelector
              availablePermissions={[]}
              selectedPermissions={getCustomPermissions(role)}
              menuAppendTo='inline'
              multilingual={true}
              isViewOnly={true}
            />
          </FlexItem>
        </Flex>
      )}
    </>
  );
};
