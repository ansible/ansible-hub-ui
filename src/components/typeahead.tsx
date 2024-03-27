import { t } from '@lingui/macro';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import React, { type CSSProperties, type ReactElement, useState } from 'react';

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

  return (
    <Select
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
      variant={
        multiple ? SelectVariant.typeaheadMulti : SelectVariant.typeahead
      }
    >
      {results.map(({ id, name }) => (
        <SelectOption key={id} value={name} />
      ))}
      {results.length === 0 ? (
        <SelectOption key={'not_found'} value={t`Not found`} isDisabled />
      ) : null}
    </Select>
  );
};
