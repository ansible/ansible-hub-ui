import { t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  DropdownItem,
  InputGroup,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';
import { StatefulDropdown } from 'src/components';
import { ParamHelper } from 'src/utilities';

class FilterOption {
  id: string;
  title: string;
  placeholder?: string;
  inputType?: 'text-field' | 'select' | 'multiple';
  options?: { id: string; title: string }[];
}

interface IProps {
  /** Configures the options that the filter displays */
  filterConfig: FilterOption[];

  /** Current page params */
  // Type help: this shoud be something like: Record<string, strgin | SelectOptionObject | (string | SelectOptionObject)[]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;

  /** Sets the current page params to p */
  updateParams: (params) => void;

  inputText: string;

  onChange: (inputText: string) => void;
}

export const CompoundFilter = ({
  filterConfig,
  params,
  updateParams,
  inputText,
  onChange,
}: IProps) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(
    filterConfig[0],
  );
  const [isOpen, setOpen] = useState<boolean>(false);

  const filterOptions = filterConfig.map((v) => (
    <DropdownItem
      onClick={() => {
        onChange('');
        setSelectedFilter(v);
      }}
      key={v.id}
    >
      {v.title}
    </DropdownItem>
  ));

  return (
    <InputGroup data-cy='compound_filter'>
      {filterConfig.length != 1 && (
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
      {renderInput(selectedFilter, {
        params,
        inputText,
        onChange,
        isOpen,
        setOpen,
        updateParams,
      })}
      <Button
        onClick={() =>
          submitFilter(undefined, {
            params,
            selectedFilter,
            inputText,
            updateParams,
          })
        }
        variant={ButtonVariant.control}
        isDisabled={!inputText.trim().length}
      >
        <SearchIcon></SearchIcon>
      </Button>
    </InputGroup>
  );
};

function renderInput(
  selectedFilter: FilterOption,
  { params, inputText, onChange, isOpen, setOpen, updateParams },
) {
  const onToggle = () => setOpen(!isOpen);

  switch (selectedFilter.inputType) {
    case 'multiple':
      return (
        <Select
          variant={SelectVariant.checkbox}
          onToggle={onToggle}
          onSelect={(e) =>
            onSelectMultiple(e, { params, selectedFilter, updateParams })
          }
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
                submitFilter(v.id, {
                  params,
                  selectedFilter,
                  inputText,
                  updateParams,
                });
              }}
              key={v.id}
            >
              {v.title}
            </DropdownItem>
          ))}
        />
      );
    default:
      return (
        <TextInput
          aria-label={selectedFilter.id}
          placeholder={
            selectedFilter.placeholder ||
            t`Filter by ${selectedFilter.title.toLowerCase()}`
          }
          value={inputText}
          onChange={(k) => onChange(k)}
          onKeyPress={(e) =>
            handleEnter(e, { inputText, params, selectedFilter, updateParams })
          }
        />
      );
  }
}

function handleEnter(e, { inputText, params, selectedFilter, updateParams }) {
  // l10n: don't translate
  if (e.key === 'Enter' && inputText.trim().length > 0) {
    submitFilter(undefined, {
      params,
      selectedFilter,
      inputText,
      updateParams,
    });
  }
}

function submitMultiple(
  newValues: string[],
  { params, selectedFilter, updateParams },
) {
  updateParams({
    ...ParamHelper.setParam(params, selectedFilter.id, newValues),
    page: 1,
  });
}

function submitFilter(
  id = undefined,
  { params, selectedFilter, inputText, updateParams },
) {
  updateParams({
    ...ParamHelper.setParam(params, selectedFilter.id, id ? id : inputText),
    page: 1,
  });
}

const onSelectMultiple = (event, { params, selectedFilter, updateParams }) => {
  const newParams = params[selectedFilter.id] || [];

  // TODO: Remove this replace after patternfly fixes the pf-random-id issue
  const selectedID = event.currentTarget.id.replace(/pf-random-id-\d+-/, '');
  if (newParams.includes(selectedID)) {
    const index = newParams.indexOf(selectedID);
    if (index > -1) {
      newParams.splice(index, 1);
    }
  } else {
    newParams.push(selectedID);
  }

  submitMultiple(newParams, { params, selectedFilter, updateParams });
};

function selectTitleById(inputText: string, selectedFilter: FilterOption) {
  if (!inputText || !selectedFilter?.options) {
    return inputText;
  }

  return selectedFilter.options.find((opt) => opt.id === inputText).title;
}
