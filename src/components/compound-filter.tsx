import { t } from '@lingui/core/macro';
import {
  Button,
  ButtonVariant,
  InputGroup,
  InputGroupItem,
  TextInput,
} from '@patternfly/react-core';
import {
  DropdownItem,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import React, { useState } from 'react';
import { StatefulDropdown, Typeahead } from 'src/components';
import { ParamHelper } from 'src/utilities';

export interface FilterOption {
  id: string;
  title: string;
  placeholder?: string;
  inputType?: 'text-field' | 'select' | 'multiple' | 'typeahead';
  options?: { id: string; title: string }[];
  hidden?: boolean;
}

interface IProps {
  filterConfig: FilterOption[];
  inputText: string;
  onChange: (inputText: string) => void;
  params;
  selectFilter?: (filterId: string) => void;
  updateParams: (params) => void;
}

export const CompoundFilter = ({
  filterConfig,
  inputText,
  onChange,
  params,
  selectFilter,
  updateParams,
}: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filterConfig[0]);

  if (filterConfig.length === 0) {
    return null;
  }

  const filterOptions = filterConfig.map((v) => (
    <DropdownItem
      onClick={() => {
        onChange('');
        setSelectedFilter(v);
        if (selectFilter) {
          selectFilter(v.id);
        }
      }}
      key={v.id}
    >
      {v.title}
    </DropdownItem>
  ));

  return (
    <InputGroup data-cy='compound_filter'>
      {filterConfig.length !== 1 && (
        <StatefulDropdown
          toggleType='dropdown'
          defaultText={
            <span>
              <FilterIcon />
              {'   '}
              {selectedFilter.title}
            </span>
          }
          position='left'
          isPlain={false}
          items={filterOptions}
        />
      )}
      {renderInput()}
      <InputGroupItem>
        <Button
          onClick={() => submitFilter()}
          variant={ButtonVariant.control}
          isDisabled={!inputText.trim().length}
        >
          <SearchIcon />
        </Button>
      </InputGroupItem>
    </InputGroup>
  );

  function renderInput() {
    switch (selectedFilter.inputType) {
      case 'multiple':
        return (
          <Select
            variant={SelectVariant.checkbox}
            onToggle={(_e) => setIsOpen(!isOpen)}
            onSelect={onSelectMultiple}
            isOpen={isOpen}
            placeholderText={t`Filter by ${selectedFilter.id.toLowerCase()}`}
            selections={params[selectedFilter.id]}
            isGrouped
          >
            {[
              <SelectGroup
                label={t`Filter by ${selectedFilter.id}`}
                key={selectedFilter.id}
              >
                {selectedFilter.options.map((option) => (
                  // patternfly does not allow for us to set a display name aside from the ID
                  // which unfortunately means that multiple select will ignore the human readable
                  // option.title
                  // FIXME: pf5?
                  <SelectOption key={option.id} value={option.id} />
                ))}
              </SelectGroup>,
            ]}
          </Select>
        );
      case 'select':
        return (
          <StatefulDropdown
            toggleType='dropdown'
            defaultText={
              selectTitleById(inputText, selectedFilter) ||
              selectedFilter.placeholder ||
              selectedFilter.title
            }
            isPlain={false}
            position='left'
            items={selectedFilter.options.map((v) => (
              <DropdownItem
                onClick={() => {
                  onChange(v.id);
                  submitFilter(v.id);
                }}
                key={v.id}
              >
                {v.title}
              </DropdownItem>
            ))}
          />
        );
      case 'typeahead': {
        const typeaheadResults = filterConfig
          .find(({ id }) => id === selectedFilter.id)
          .options.map(({ id, title }) => ({ id, name: title }));

        return (
          <Typeahead
            loadResults={(name) => {
              onChange(name);
            }}
            onClear={() => {
              onChange('');
            }}
            onSelect={(event, value) => {
              const item = typeaheadResults.find(({ name }) => name === value);
              submitFilter(item?.id || value);
            }}
            placeholderText={
              selectedFilter?.placeholder ||
              t`Filter by ${selectedFilter.title.toLowerCase()}`
            }
            results={typeaheadResults}
          />
        );
      }
      default:
        return (
          <TextInput
            aria-label={selectedFilter.id}
            placeholder={
              selectedFilter.placeholder ||
              t`Filter by ${selectedFilter.title.toLowerCase()}`
            }
            value={inputText}
            onChange={(_event, k) => onChange(k)}
            onKeyPress={(e) => handleEnter(e)}
          />
        );
    }
  }

  function handleEnter(e) {
    // l10n: don't translate
    if (e.key === 'Enter' && inputText.trim().length > 0) {
      submitFilter();
    }
  }

  function submitMultiple(newValues: string[]) {
    updateParams({
      ...ParamHelper.setParam(params, selectedFilter.id, newValues),
      page: 1,
    });
  }

  function submitFilter(id = undefined) {
    updateParams({
      ...ParamHelper.setParam(params, selectedFilter.id, id ? id : inputText),
      page: 1,
    });
  }

  function onSelectMultiple(event) {
    let newParams = params[selectedFilter.id];

    // no tags => falsy
    // 1 tag => "foo"
    // 2+ tags => ["foo", "bar"]
    // convert all to an array
    if (!newParams) {
      newParams = [];
    }
    if (!Array.isArray(newParams)) {
      newParams = [newParams];
    }

    // FIXME: TODO: Remove after patternfly fixes the pf-random-id issue
    const selectedID = event.currentTarget.id.replace(/pf-random-id-\d+-/, '');
    if (newParams.includes(selectedID)) {
      const index = newParams.indexOf(selectedID);
      if (index > -1) {
        newParams.splice(index, 1);
      }
    } else {
      newParams.push(selectedID);
    }

    submitMultiple(newParams);
  }

  function selectTitleById(inputText: string, selectedFilter: FilterOption) {
    if (!inputText || !selectedFilter?.options) {
      return inputText;
    }

    return selectedFilter.options.find((opt) => opt.id === inputText).title;
  }
};
