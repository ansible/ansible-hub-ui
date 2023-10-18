import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import {
  AppliedFilters,
  CompoundFilter,
  FilterOption,
  Pagination,
  Sort,
  SortFieldType,
} from 'src/components';
import { ParamType } from 'src/utilities';

interface IProps {
  count?: number;
  filterConfig: FilterOption[];
  ignoredParams: string[];
  params: ParamType;
  sortOptions?: SortFieldType[];
  updateParams: (p) => void;
}

// FIXME: missing Buttons & CardListSwitcher to be usable everywhere
export function HubListToolbar({
  ignoredParams,
  params,
  updateParams,
  filterConfig,
  sortOptions,
  count,
}: IProps) {
  const [inputText, setInputText] = useState('');

  const niceNames = Object.fromEntries(
    filterConfig.map(({ id, title }) => [id, title]),
  );

  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup
          style={{
            alignItems: 'start',
            alignSelf: 'start',
            flexDirection: 'column',
          }}
        >
          <ToolbarItem>
            <CompoundFilter
              filterConfig={filterConfig}
              inputText={inputText}
              onChange={setInputText}
              params={params}
              updateParams={updateParams}
            />
          </ToolbarItem>
          <ToolbarItem>
            <AppliedFilters
              ignoredParams={ignoredParams}
              niceNames={niceNames}
              params={params}
              style={{ marginTop: '16px' }}
              updateParams={updateParams}
            />
          </ToolbarItem>
        </ToolbarGroup>
        {sortOptions ? (
          <ToolbarItem style={{ alignSelf: 'start' }}>
            <Sort
              options={sortOptions}
              params={params}
              updateParams={updateParams}
            />
          </ToolbarItem>
        ) : null}
        <ToolbarItem
          alignment={{ default: 'alignRight' }}
          style={{ alignSelf: 'start' }}
        >
          <Pagination
            params={params}
            updateParams={updateParams}
            count={count}
            isTop
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
}
