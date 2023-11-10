import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
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
  typeaheads?: Record<
    string,
    (inputText: string) => Promise<{ id: string; title: string }[]>
  >;
  updateParams: (p) => void;
}

function useTypeaheads(typeaheads, { inputText, selectedFilter }) {
  const [options, setOptions] = useState({});
  const loader = typeaheads[selectedFilter];
  const setter = (value) =>
    setOptions((options) => ({ ...options, [selectedFilter]: value }));

  useEffect(() => {
    if (selectedFilter && loader) {
      loader('').then(setter);
    }
  }, [selectedFilter]);

  useEffect(() => {
    if (inputText && loader) {
      loader(inputText).then(setter);
    }
  }, [inputText]);

  return options;
}

// FIXME: missing Buttons & CardListSwitcher to be usable everywhere
export function HubListToolbar({
  count,
  filterConfig,
  ignoredParams,
  params,
  sortOptions,
  typeaheads,
  updateParams,
}: IProps) {
  const [inputText, setInputText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const typeaheadOptions = useTypeaheads(typeaheads || {}, {
    inputText,
    selectedFilter,
  });

  const niceNames = Object.fromEntries(
    filterConfig.map(({ id, title }) => [id, title]),
  );

  const filterWithOptions = filterConfig.map((item) =>
    item.inputType !== 'typeahead'
      ? item
      : { ...item, options: item.options || typeaheadOptions[item.id] || [] },
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
              filterConfig={filterWithOptions}
              inputText={inputText}
              onChange={setInputText}
              params={params}
              selectFilter={setSelectedFilter}
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
