import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { ReactNode, useEffect, useState } from 'react';
import {
  AppliedFilters,
  CardListSwitcher,
  CompoundFilter,
  FilterOption,
  Pagination,
  Sort,
  SortFieldType,
} from 'src/components';
import { ParamType } from 'src/utilities';

interface IProps {
  buttons?: ReactNode[];
  count?: number;
  filterConfig: FilterOption[];
  ignoredParams: string[];
  params: ParamType;
  sortOptions?: SortFieldType[];
  switcher?: string;
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

export function HubListToolbar({
  buttons,
  count,
  filterConfig,
  ignoredParams,
  params,
  sortOptions,
  switcher,
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

  const filterWithOptions = filterConfig
    .filter(({ hidden }) => !hidden)
    .map((item) =>
      item.inputType !== 'typeahead'
        ? item
        : { ...item, options: item.options || typeaheadOptions[item.id] || [] },
    );

  const renderedButtons = buttons?.length
    ? buttons.map((button, i) =>
        button ? <ToolbarItem key={`button${i}`}>{button}</ToolbarItem> : null,
      )
    : null;

  return (
    <Toolbar style={{ paddingLeft: '8px' }} data-cy='hub-list-toolbar'>
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
          <ToolbarGroup style={{ alignSelf: 'start' }}>
            <ToolbarItem>
              <Sort
                options={sortOptions}
                params={params}
                updateParams={updateParams}
              />
            </ToolbarItem>
            {renderedButtons}
          </ToolbarGroup>
        ) : (
          renderedButtons
        )}
        <ToolbarGroup
          alignment={{ default: 'alignRight' }}
          style={{ alignSelf: 'start' }}
        >
          {switcher ? (
            <ToolbarItem>
              <CardListSwitcher
                size='sm'
                params={params}
                updateParams={(p) => {
                  window.localStorage.setItem(switcher, p.view_type);
                  updateParams(p);
                }}
              />
            </ToolbarItem>
          ) : null}
          <ToolbarItem>
            <Pagination
              params={params}
              updateParams={updateParams}
              count={count}
              isTop
            />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
}
