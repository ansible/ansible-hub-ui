import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import React, { type Ref, useState } from 'react';

// single select component - render options object in order, onSelect(option key), selected=option key
export const HubSelect = ({
  onSelect,
  options,
  selected,
}: {
  onSelect: (value) => void;
  options: Record<string, string>;
  selected: string;
}) => {
  const [isOpen, setOpen] = useState(false);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      isExpanded={isOpen}
      isFullWidth
      onClick={() => setOpen(!isOpen)}
      ref={toggleRef}
    >
      {options[selected]}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      onOpenChange={(isOpen) => setOpen(isOpen)}
      onSelect={(_event, value) => {
        onSelect(value);
        setOpen(false);
      }}
      selected={selected}
      toggle={toggle}
    >
      {Object.entries(options).map(([k, v]) => (
        <SelectOption key={k} value={k}>
          {v}
        </SelectOption>
      ))}
    </Select>
  );
};
