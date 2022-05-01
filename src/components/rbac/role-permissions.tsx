import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';
import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { PermissionChipSelector } from 'src/components';
import { twoWayMapper } from 'src/utilities';

interface IProps {
  filteredPermissions: { [key: string]: string };
  selectedPermissions: string[];
  setPermissions?: (permissions) => void;
  showEmpty: boolean;
  showCustom: boolean;
}

export const RolePermissions: React.FC<IProps> = ({
  filteredPermissions,
  selectedPermissions,
  setPermissions,
  showCustom,
  showEmpty,
}) => {
  const permFilter = (availablePermissions) =>
    selectedPermissions
      .filter((selected) =>
        availablePermissions.find((perm) => selected === perm),
      )
      .map((value) => twoWayMapper(value, filteredPermissions) ?? value);

  const getSelected = (group) => permFilter(group.object_permissions);

  const customPermissions = selectedPermissions.filter(
    (perm) => !Object.keys(filteredPermissions).includes(perm),
  );

  const origGroups = Constants.PERMISSIONS.map((group) => ({
    ...group,
    label: i18n._(group.label),
  }));
  const allGroups = showCustom
    ? [
        ...origGroups,
        {
          name: 'custom',
          label: t`Custom permissions`,
          object_permissions: customPermissions,
        },
      ]
    : origGroups;
  const groups = showEmpty
    ? allGroups
    : allGroups.filter((group) => getSelected(group).length);

  return (
    <>
      {groups.map((group) => (
        <Flex
          style={{ marginTop: '16px' }}
          alignItems={{ default: 'alignItemsCenter' }}
          key={group.name}
          className={group.name}
        >
          <FlexItem style={{ minWidth: '200px' }}>{group.label}</FlexItem>
          <FlexItem grow={{ default: 'grow' }}>
            <PermissionChipSelector
              isViewOnly={!setPermissions}
              menuAppendTo='inline'
              multilingual={true}
              selectedPermissions={getSelected(group).filter(Boolean)}
              {...(setPermissions
                ? {
                    availablePermissions: group.object_permissions
                      .filter(
                        (perm) =>
                          !selectedPermissions.find(
                            (selected) => selected === perm,
                          ),
                      )
                      .map((value) => twoWayMapper(value, filteredPermissions))
                      .sort(),
                    setSelected: setPermissions,
                    onClear: () => {
                      const clearedPermissions = group.object_permissions;
                      setPermissions(
                        selectedPermissions.filter(
                          (x) => !clearedPermissions.includes(x),
                        ),
                      );
                    },
                    onSelect: (event, selection) => {
                      const newPermissions = new Set(selectedPermissions);
                      if (
                        newPermissions.has(
                          twoWayMapper(selection, filteredPermissions),
                        )
                      ) {
                        newPermissions.delete(
                          twoWayMapper(selection, filteredPermissions),
                        );
                      } else {
                        newPermissions.add(
                          twoWayMapper(selection, filteredPermissions),
                        );
                      }
                      setPermissions(Array.from(newPermissions));
                    },
                  }
                : {})}
            />
          </FlexItem>
        </Flex>
      ))}
    </>
  );
};


/* TODO update from .. changed during rbac .. probably start from scratch
            {groups.map((group) => (
              <Flex
                style={{ marginTop: '16px' }}
                alignItems={{ default: 'alignItemsCenter' }}
                key={group.name}
                className={group.name}
                data-cy={`RoleForm-Permissions-row-${group.name}`}
              >
                <FlexItem style={{ minWidth: '200px' }}>
                  {i18n._(group.label)}
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }}>
                  <PermissionChipSelector
                    availablePermissions={group.object_permissions
                      .filter(
                        (perm) =>
                          !selectedPermissions.find(
                            (selected) => selected === perm,
                          ),
                      )
                      .map((value) => twoWayMapper(value, filteredPermissions))
                      .sort()}
                    selectedPermissions={selectedPermissions
                      .filter((selected) =>
                        group.object_permissions.find(
                          (perm) => selected === perm,
                        ),
                      )
                      .map((value) => twoWayMapper(value, filteredPermissions))}
                    setSelected={(perms) =>
                      this.setState({ permissions: perms })
                    }
                    menuAppendTo='inline'
                    multilingual={true}
                    isViewOnly={false}
                    onClear={() => {
                      const clearedPerms = group.object_permissions;
                      this.setState({
                        permissions: this.state.permissions.filter(
                          (x) => !clearedPerms.includes(x),
                        ),
                      });
                    }}
                    onSelect={(event, selection) => {
                      const newPerms = new Set(this.state.permissions);
                      if (
                        newPerms.has(
                          twoWayMapper(selection, filteredPermissions),
                        )
                      ) {
                        newPerms.delete(
                          twoWayMapper(selection, filteredPermissions),
                        );
                      } else {
                        newPerms.add(
                          twoWayMapper(selection, filteredPermissions),
                        );
                      }
                      this.setState({
                        permissions: Array.from(newPerms),
                      });
                    }}
                  />
                </FlexItem>
              </Flex>
            ))}
=======*/
