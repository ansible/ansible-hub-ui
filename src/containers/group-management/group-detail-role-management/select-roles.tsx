import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';

import { RoleType, RoleAPI } from 'src/api';

import { Flex, FlexItem, Label } from '@patternfly/react-core';
import {
  CompoundFilter,
  RoleListTable,
  Pagination,
  AppliedFilters,
  LoadingPageSpinner,
  CheckboxRow,
  EmptyStateFilter,
  EmptyStateCustom,
} from 'src/components';

import './group-detail-role-management.scss';
import { filterIsSet } from 'src/utilities';

import { CubesIcon } from '@patternfly/react-icons';

interface SelectRolesProps {
  assignedRoles: RoleType[];
  selectedRoles: RoleType[];
  onRolesUpdate?: (roles) => void;
}

const SelectRoles: React.FC<SelectRolesProps> = ({
  assignedRoles,
  selectedRoles,
  onRolesUpdate,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [rolesItemCount, setRolesItemCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [localParams, setLocalParams] = useState({
    page: 1,
    page_size: 10,
  });

  useEffect(() => {
    queryRoles();
  }, [localParams]);

  const queryRoles = () => {
    setLoading(true);
    RoleAPI.list(localParams).then(({ data }) => {
      setRoles(data.results);
      setRolesItemCount(data.count);
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className='custom-wizard-layout loading-wizard'>
        <LoadingPageSpinner />
      </div>
    );
  }

  const isRoleSelected = (name) =>
    selectedRoles.map((r) => r.name).includes(name);

  const noData = roles.length === 0;

  if (noData && !filterIsSet(localParams, ['name__icontains'])) {
    return (
      <div className='custom-wizard-layout no-data'>
        <EmptyStateCustom
          title={t`No assignable roles.`}
          description={t`There are currently no roles that can be assigned to this group.`}
          icon={CubesIcon}
        />
      </div>
    );
  }

  const isAssigned = (name) => assignedRoles.some((role) => role.name === name);

  const tabHeader = {
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
    ],
  };

  return (
    <div className='custom-wizard-layout'>
      <Flex
        justifyContent={{
          default: noData
            ? 'justifyContentFlexStart'
            : 'justifyContentSpaceBetween',
        }}
        direction={{ default: 'column' }}
      >
        <FlexItem className='select-roles-content'>
          <Flex
            justifyContent={{
              default: noData
                ? 'justifyContentFlexStart'
                : 'justifyContentSpaceBetween',
            }}
            direction={{ default: 'column' }}
            className='inner-roles-content'
          >
            {Object.keys(selectedRoles).length !== 0 && (
              <FlexItem>
                <Flex>
                  <FlexItem>
                    <strong>Selected Roles</strong>
                  </FlexItem>

                  <FlexItem flex={{ default: 'flex_1' }}>
                    <Flex>
                      {selectedRoles.map((role) => (
                        <FlexItem key={role.name} className='permission'>
                          <Label
                            onClose={() =>
                              onRolesUpdate(
                                selectedRoles.filter(
                                  (r) => r.name !== role.name,
                                ),
                              )
                            }
                          >
                            {role.name}
                          </Label>
                        </FlexItem>
                      ))}
                    </Flex>
                  </FlexItem>
                </Flex>
              </FlexItem>
            )}

            <FlexItem>
              <div className='filter'>
                <CompoundFilter
                  inputText={inputText}
                  onChange={(inputText) => setInputText(inputText)}
                  params={localParams}
                  updateParams={(p) => setLocalParams(p)}
                  filterConfig={[
                    {
                      id: 'name__icontains',
                      title: t`Name`,
                    },
                  ]}
                />
              </div>

              <AppliedFilters
                updateParams={(p) => {
                  setLocalParams(p);
                  setInputText('');
                }}
                params={localParams}
                niceNames={{ name__icontains: t`Name` }}
                ignoredParams={['sort', 'page_size', 'page']}
                style={{ marginTop: '8px' }}
              />
            </FlexItem>

            <FlexItem style={{ flexGrow: 1 }}>
              {noData && filterIsSet(localParams, ['name__icontains']) ? (
                <div className='no-filter-data'>
                  <EmptyStateFilter />
                </div>
              ) : (
                <div className='selected-roles-list'>
                  <RoleListTable
                    isStickyHeader
                    params={localParams}
                    updateParams={(p) => {
                      setLocalParams(p);
                    }}
                    tableHeader={tabHeader}
                  >
                    {roles.map((role, i) => (
                      <CheckboxRow
                        rowIndex={i}
                        key={role.name}
                        isSelected={
                          isRoleSelected(role.name) || isAssigned(role.name)
                        }
                        onSelect={() =>
                          onRolesUpdate(
                            isRoleSelected(role.name)
                              ? selectedRoles.filter(
                                  (r) => r.name !== role.name,
                                )
                              : [...selectedRoles, role],
                          )
                        }
                        isDisabled={isAssigned(role.name)}
                        data-cy={`RoleListTable-row-${role.name}`}
                      >
                        <td>{role.name}</td>
                        <td>{role.description}</td>
                      </CheckboxRow>
                    ))}
                  </RoleListTable>
                </div>
              )}
            </FlexItem>
          </Flex>
        </FlexItem>

        {!noData && (
          <FlexItem>
            <Pagination
              params={localParams}
              updateParams={(p) => setLocalParams(p)}
              count={rolesItemCount}
              style={{ padding: '0px' }}
            />
          </FlexItem>
        )}
      </Flex>
    </div>
  );
};
export default SelectRoles;
