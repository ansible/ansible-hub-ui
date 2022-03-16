import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';

import React, { useState } from 'react';

import {
  StatefulDropdown,
  SortTable,
  PermissionChipSelector,
} from 'src/components';

import { Flex, FlexItem } from '@patternfly/react-core';
import {
  TableComposable,
  Tr,
  Tbody,
  Td,
  ExpandableRowContent,
} from '@patternfly/react-table';

import { RoleType } from 'src/api';

import { twoWayMapper } from 'src/utilities';

import { Constants } from 'src/constants';

interface Props {
  roles: RoleType[];
  dropdownActions?: JSX.Element[];
  isUserManagementDisabled?: boolean;
  params?: object;
  updateParams?: (params) => void;
  isCompact?: boolean;
  variant?: 'expandable' | 'checkbox' | 'radio';
  tableHeader?: {
    headers: {
      title: string;
      type: string;
      id: string;
    }[];
  };
  selected?: RoleType[] | RoleType;
  onSelect?: (selectedRole: RoleType, selectedRoles?: RoleType[]) => void;
}

export const RoleListTable = ({
  roles,
  isUserManagementDisabled,
  dropdownActions,
  params,
  updateParams,
  isCompact,
  variant = 'expandable',
  tableHeader,
  selected,
  onSelect,
}: Props) => {
  if (variant === 'checkbox' && !Array.isArray(selected)) {
    throw new Error(
      'Invalid type passed into `selected`. Variant `checkbox` expected type Array.',
    );
  }

  if (variant === 'radio' && Array.isArray(selected)) {
    throw new Error(
      'Invalid type passed into `selected`. Variant `radio` expected type Object.',
    );
  }

  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);

  const isRoleExpanded = (role) => expandedRoles.includes(role);

  const isRoleSelected = (role: RoleType) => {
    return (selected as RoleType[])
      .map((role) => role.name)
      .includes(role.name);
  };

  const handleToggleRole = (role) => {
    setExpandedRoles((prevState) =>
      prevState.includes(role)
        ? prevState.filter((r) => r !== role)
        : [...prevState, role],
    );
  };

  const onSelectRole = (role) => {
    if (variant === 'checkbox') {
      const selectedRoles = selected as RoleType[];
      const updatedRoles = isRoleSelected(role)
        ? selectedRoles.filter((r) => r.name !== role.name)
        : [...selectedRoles, role];
      onSelect(role, updatedRoles);
    }

    if (variant === 'radio') {
      onSelect(role as RoleType);
    }
  };

  const allPermissions = [...Constants.PERMISSIONS];
  const filteredPermissions = { ...Constants.HUMAN_PERMISSIONS };

  if (isUserManagementDisabled) {
    Constants.USER_GROUP_MGMT_PERMISSIONS.forEach((perm) => {
      if (perm in filteredPermissions) {
        delete filteredPermissions[perm];
      }
    });
  }

  const defaultTableHeader = {
    headers: [
      {
        title: '',
        type: 'none',
        id: 'expander',
      },
      {
        title: t`Role`,
        type: 'alpha',
        id: 'name',
      },
      {
        title: t`Description`,
        type: 'none',
        id: 'description',
      },
      {
        title: '',
        type: 'none',
        id: 'kebab',
      },
    ],
  };

  return (
    <TableComposable
      aria-label='role-list-table'
      data-cy='RoleListTable'
      variant={isCompact ? 'compact' : undefined}
    >
      <SortTable
        options={tableHeader ?? defaultTableHeader}
        params={params}
        updateParams={updateParams}
      />
      {roles.map((role, rowIndex) => (
        <Tbody key={rowIndex} isExpanded={isRoleExpanded(role.name)}>
          <Tr>
            {variant === 'expandable' && (
              <Td
                expand={{
                  isExpanded: isRoleExpanded(role.name),
                  onToggle: () => handleToggleRole(role.name),
                  rowIndex,
                }}
              />
            )}

            {variant === 'checkbox' && (
              <Td
                select={{
                  rowIndex,
                  onSelect: () => onSelectRole(role),
                  isSelected: isRoleSelected(role),
                  variant: 'checkbox',
                }}
              />
            )}

            {variant === 'radio' && (
              <Td
                select={{
                  rowIndex,
                  onSelect: () => onSelectRole(role),
                  isSelected: (selected as RoleType)?.name === role.name,
                  variant: 'radio',
                }}
              />
            )}
            <Td>{role.name}</Td>
            <Td>{role.description}</Td>
            {dropdownActions && (
              <Td style={{ paddingRight: '0px', textAlign: 'right' }}>
                <div data-cy='kebab-toggle'>
                  <StatefulDropdown
                    items={dropdownActions.map((item, i) => {
                      if (!item?.props?.onClick) {
                        return item;
                      }
                      const updatedProps = { ...item.props };
                      delete updatedProps['onClick'];

                      const updatedItem = {
                        ...item,
                        props: updatedProps,
                      };

                      return (
                        <div
                          key={i}
                          onClick={() => item.props.onClick(role.name)}
                        >
                          {updatedItem}
                        </div>
                      );
                    })}
                  />
                </div>
              </Td>
            )}
          </Tr>
          <Tr isExpanded={isRoleExpanded(role.name)}>
            <Td colSpan={4}>
              <ExpandableRowContent>
                {Object.keys(role?.permissions).length > 0 &&
                  allPermissions.map((group) => (
                    <Flex
                      style={{ marginTop: '16px' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                      key={group.name}
                      className={group.name}
                    >
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
                          selectedPermissions={role.permissions
                            .filter((selected) =>
                              group.object_permissions.find(
                                (perm) => selected === perm,
                              ),
                            )
                            .map((value) =>
                              twoWayMapper(value, filteredPermissions),
                            )}
                          menuAppendTo='inline'
                          multilingual={true}
                          isViewOnly={true}
                        />
                      </FlexItem>
                    </Flex>
                  ))}
              </ExpandableRowContent>
            </Td>
          </Tr>
        </Tbody>
      ))}
    </TableComposable>
  );
};
