import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core';
import React from 'react';

export const AllReposSelector: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('toggle-split-button');
    element.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const dropdownItems = [
    <DropdownItem key='link'>Link</DropdownItem>,
    <DropdownSeparator key='separator' />,
  ];

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={
        <DropdownToggle
          splitButtonItems={[
            <DropdownToggleCheckbox
              id='split-button-toggle-checkbox'
              key='split-checkbox'
              aria-label='Select all'
            />,
          ]}
          onToggle={onToggle}
          id='toggle-split-button'
        />
      }
      isOpen={isOpen}
      dropdownItems={dropdownItems}
    />
  );
};
