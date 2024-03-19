import { Trans, t } from '@lingui/macro';
import { Flex, FlexItem, Label } from '@patternfly/react-core';
import { Td } from '@patternfly/react-table';
import React, { type FunctionComponent, useEffect, useState } from 'react';
import { GroupAPI, type GroupType } from 'src/api';
import {
  AppliedFilters,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  HubPagination,
  LoadingSpinner,
  RadioRow,
  RoleListTable,
} from 'src/components';
import { filterIsSet } from 'src/utilities';

interface IProps {
  assignedGroups: GroupType[];
  selectedGroup?: GroupType;
  updateGroup?: (group) => void;
}

export const SelectGroup: FunctionComponent<IProps> = ({
  assignedGroups,
  selectedGroup,
  updateGroup,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [groupsCount, setGroupsCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [localParams, setLocalParams] = useState({
    page: 1,
    page_size: 10,
  });

  useEffect(() => {
    queryGroups();
  }, [localParams]);

  const queryGroups = () => {
    setLoading(true);
    GroupAPI.list(localParams).then(({ data }) => {
      setGroups(data.data);
      setGroupsCount(data.meta.count);
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className='hub-custom-wizard-layout hub-loading-wizard'>
        <LoadingSpinner />
      </div>
    );
  }

  const isSelected = ({ name }) => selectedGroup?.name === name;

  const noData = groups.length === 0;

  if (noData && !filterIsSet(localParams, ['name__icontains'])) {
    return (
      <div className='hub-custom-wizard-layout hub-no-data'>
        <EmptyStateNoData
          title={t`No assignable groups.`}
          description={t`There are currently no groups that can be assigned ownership.`}
        />
      </div>
    );
  }

  const isAssigned = ({ name }) =>
    assignedGroups.some((group) => group.name === name);

  const tabHeader = {
    headers: [
      {
        title: '',
        type: 'none',
        id: 'expander',
      },
      {
        title: t`Group`,
        type: 'alpha',
        id: 'name',
      },
    ],
  };

  return (
    <div className='hub-custom-wizard-layout'>
      <Flex
        justifyContent={{
          default: noData
            ? 'justifyContentFlexStart'
            : 'justifyContentSpaceBetween',
        }}
        direction={{ default: 'column' }}
      >
        <FlexItem className='hub-select-roles-content'>
          <Flex
            justifyContent={{
              default: noData
                ? 'justifyContentFlexStart'
                : 'justifyContentSpaceBetween',
            }}
            direction={{ default: 'column' }}
          >
            {selectedGroup ? (
              <FlexItem>
                <Flex>
                  <FlexItem>
                    <strong>
                      <Trans>Selected group</Trans>
                    </strong>
                  </FlexItem>

                  <FlexItem flex={{ default: 'flex_1' }}>
                    <Flex>
                      <FlexItem
                        key={selectedGroup.name}
                        className='hub-permission'
                      >
                        <Label>{selectedGroup.name}</Label>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </FlexItem>
            ) : null}

            <FlexItem>
              <div className='hub-filter'>
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
                <div className='hub-no-filter-data'>
                  <EmptyStateFilter />
                </div>
              ) : (
                <div className='hub-selected-roles-list'>
                  <RoleListTable
                    isStickyHeader
                    params={localParams}
                    updateParams={(p) => {
                      setLocalParams(p);
                    }}
                    tableHeader={tabHeader}
                  >
                    {groups.map((group, i) => (
                      <RadioRow
                        rowIndex={i}
                        key={group.name}
                        isSelected={isSelected(group)}
                        onSelect={() => updateGroup(group)}
                        isDisabled={isAssigned(group)}
                        data-cy={`GroupListTable-CheckboxRow-row-${group.name}`}
                      >
                        <Td>{group.name}</Td>
                      </RadioRow>
                    ))}
                  </RoleListTable>
                </div>
              )}
            </FlexItem>
          </Flex>
        </FlexItem>

        {!noData && (
          <FlexItem>
            <HubPagination
              params={localParams}
              updateParams={(p) => setLocalParams(p)}
              count={groupsCount}
            />
          </FlexItem>
        )}
      </Flex>
    </div>
  );
};
