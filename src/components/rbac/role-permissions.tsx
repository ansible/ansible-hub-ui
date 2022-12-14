import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';
import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { PermissionChipSelector } from 'src/components';
import { twoWayMapper } from 'src/utilities';
import { useContext } from 'src/loaders/app-context';

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
  const { model_permissions } = useContext().user;
  const permFilter = (availablePermissions) =>
    selectedPermissions
      .filter((selected) =>
        availablePermissions.find((perm) => selected === perm),
      )
      .map((value) => twoWayMapper(model_permissions, value) ?? value);

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
                      .map((value) => twoWayMapper(model_permissions, value))
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
                          twoWayMapper(model_permissions, selection),
                        )
                      ) {
                        newPermissions.delete(
                          twoWayMapper(model_permissions, selection),
                        );
                      } else {
                        newPermissions.add(
                          twoWayMapper(model_permissions, selection),
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
