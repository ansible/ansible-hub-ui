import { t } from '@lingui/macro';
import {
  Button,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import React, {
  type CSSProperties,
  type ReactElement,
  type Ref,
  useState,
} from 'react';
import { Chip, ChipGroup } from 'src/components';

interface IProps {
  isDisabled?: boolean;
  loadResults: (filter: string) => void;
  menuAppendTo?: 'parent' | 'inline';
  multiple?: boolean;
  onClear?: () => void;
  onSelect: (event, selection, isPlaceholder) => void;
  placeholderText?: string;
  results: { name: string; id: number | string }[];
  selections?: { name: string; id: number | string }[];
  style?: CSSProperties;
  toggleIcon?: ReactElement;
}

export const Typeahead = ({
  isDisabled,
  loadResults,
  menuAppendTo,
  multiple,
  onClear,
  onSelect,
  placeholderText,
  results,
  selections,
  style,
  toggleIcon,
}: IProps) => {
  const [isOpen, setOpen] = useState(false);
  const selected = selections?.map((group) => group.name) || null;

  const toggle = (toggleRef: Ref<MenuToggleElement>) => {
    const isEmpty = multiple ? !selected.length : !inputValue;

    return (
      <MenuToggle
        isExpanded={isOpen}
        isFullWidth
        onClick={onToggleClick}
        ref={toggleRef}
        variant='typeahead'
      >
        <TextInputGroup isPlain>
          <TextInputGroupMain
            value={inputValue}
            onClick={onToggleClick}
            onChange={onTextInputChange}
            onKeyDown={onInputKeyDown}
            autoComplete='off'
            innerRef={textInputRef}
            placeholder={t`TODO Select a state`}
            {...(activeItem && { 'aria-activedescendant': activeItem })}
            role='combobox'
            isExpanded={isOpen}
          >
            {multiple ? (
              <ChipGroup aria-label={t`Current selections`}>
                {selected.map((selection, index) => (
                  <Chip
                    key={index}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelect(selection);
                    }}
                  >
                    {selection}
                  </Chip>
                ))}
              </ChipGroup>
            ) : null}
          </TextInputGroupMain>
          <TextInputGroupUtilities>
            {!isEmpty ? (
              <Button
                variant='plain'
                onClick={
                  multiple
                    ? () => {
                        setInputValue('');
                        setSelected([]);
                        textInputRef?.current?.focus();
                      }
                    : () => {
                        setSelected('');
                        setInputValue('');
                        setFilterValue('');
                        textInputRef?.current?.focus();
                      }
                }
                aria-label={t`Clear input value`}
              >
                <TimesIcon aria-hidden />
              </Button>
            ) : null}
          </TextInputGroupUtilities>
        </TextInputGroup>
      </MenuToggle>
    );
  };

  return (
    <Select
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={() => setIsOpen(false)}
      toggle={toggle}
    >
      {multiple ? (
        <SelectList isAriaMultiselectable>
          {selectOptions.map((option, index) => (
            <SelectOption
              key={option.value || option.children}
              isFocused={focusedItemIndex === index}
              className={option.className}
              {...option}
            />
          ))}
        </SelectList>
      ) : (
        <SelectList>
          {selectOptions.map((option, index) => (
            <SelectOption
              key={option.value || option.children}
              isFocused={focusedItemIndex === index}
              className={option.className}
              onClick={() => setSelected(option.value)}
              {...option}
              ref={null}
            />
          ))}
        </SelectList>
      )}
    </Select>
  );

  return (
    <Select
      toggle={toggle}
      hasInlineFilter
      isDisabled={isDisabled}
      isOpen={isOpen}
      menuAppendTo={menuAppendTo}
      onClear={() => {
        loadResults('');
        onClear?.();
      }}
      onFilter={(_e, value) => {
        loadResults(value);
      }}
      onSelect={(event, selection, isPlaceholder) => {
        onSelect(event, selection, isPlaceholder);
        if (!multiple) {
          setOpen(false);
          loadResults('');
        }
      }}
      onToggle={(_e, isOpen) => setOpen(isOpen)}
      placeholderText={placeholderText}
      selections={selected}
      style={style}
      toggleIcon={toggleIcon}
    >
      {results.map(({ id, name }) => (
        <SelectOption key={id} value={name} />
      ))}
      {results.length === 0 ? (
        <SelectOption key='not_found' value={t`Not found`} isDisabled />
      ) : null}
    </Select>
  );
};
