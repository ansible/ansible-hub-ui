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
  params: object;
  updateParams?: (params) => void;
  isCompact?: boolean;
}

export const RoleListTable = ({
  roles,
  isUserManagementDisabled,
  dropdownActions,
  params,
  updateParams,
  isCompact,
}: Props) => {
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);

  const isRoleExpanded = (role) => expandedRoles.includes(role);

  const handleToggleRole = (role) => {
    setExpandedRoles((prevState) =>
      prevState.includes(role)
        ? prevState.filter((r) => r !== role)
        : [...prevState, role],
    );
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

  const sortTableOptions = {
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
        options={sortTableOptions}
        params={params}
        updateParams={updateParams}
      />
      {roles.map(({ name, description, permissions }, i) => (
        <Tbody key={i} isExpanded={isRoleExpanded(name)}>
          <Tr>
            <Td
              expand={{
                isExpanded: isRoleExpanded(name),
                onToggle: () => handleToggleRole(name),
                rowIndex: i,
              }}
            />
            <Td>{name}</Td>
            <Td>{description}</Td>
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

                      const role = { name, description, permissions };
                      return (
                        <div key={i} onClick={() => item.props.onClick(role)}>
                          {updatedItem}
                        </div>
                      );
                    })}
                  />
                </div>
              </Td>
            )}
          </Tr>
          <Tr isExpanded={isRoleExpanded(name)}>
            <Td colSpan={4}>
              <ExpandableRowContent>
                {allPermissions.map((group) => (
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
                              !permissions.find(
                                (selected) => selected === perm,
                              ),
                          )
                          .map((value) =>
                            twoWayMapper(value, filteredPermissions),
                          )
                          .sort()}
                        selectedPermissions={permissions
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
