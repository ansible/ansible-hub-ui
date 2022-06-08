import { t, Trans } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { Flex, FlexItem, Label } from '@patternfly/react-core';
import { GroupType, GroupAPI } from 'src/api';
import {
  CompoundFilter,
  RoleListTable,
  Pagination,
  AppliedFilters,
  LoadingPageSpinner,
  RadioRow,
  EmptyStateFilter,
  EmptyStateNoData,
} from 'src/components';
import { filterIsSet } from 'src/utilities';

interface IProps {
  assignedGroups: GroupType[];
  selectedGroup?: GroupType;
  updateGroup?: (group) => void;
}

export const SelectGroup: React.FC<IProps> = ({
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
        <LoadingPageSpinner />
      </div>
    );
  }

  const isSelected = ({ name }) => selectedGroup?.name === name;

  const noData = groups.length === 0;

  if (noData && !filterIsSet(localParams, ['name__contains'])) {
    return (
      <div className='hub-custom-wizard-layout hub-no-data'>
        <EmptyStateNoData
          title={t`No assignable groups.`}
          description={t`There are currently no groups that can be assigned to this namespace.`}
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
                      id: 'name__contains',
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
                niceNames={{ name__contains: t`Name` }}
                ignoredParams={['sort', 'page_size', 'page']}
                style={{ marginTop: '8px' }}
              />
            </FlexItem>

            <FlexItem style={{ flexGrow: 1 }}>
              {noData && filterIsSet(localParams, ['name__contains']) ? (
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
                        <td>{group.name}</td>
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
            <Pagination
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
