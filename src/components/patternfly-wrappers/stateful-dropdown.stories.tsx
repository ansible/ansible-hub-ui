import * as React from 'react';
import {
  TextInput,
  InputGroup,
  Button,
  ButtonVariant,
  DropdownItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { StatefulDropdown } from './stateful-dropdown';

export default {
  title: 'Components / StatefulDropdown',
};

const filterOptions = [
  <DropdownItem onClick={() => console.log('clicked option one')} key={1}>
    Option 1
  </DropdownItem>,
  <DropdownItem onClick={() => console.log('clicked option two')} key={2}>
    Option 2
  </DropdownItem>,
];

export const basic = () => (
  <StatefulDropdown
    toggleType='dropdown'
    defaultText={
      <span>
        <FilterIcon />
        {'   '}
        Dropdown
      </span>
    }
    position='left'
    isPlain={false}
    items={filterOptions}
  />
);

export const isPlain = () => (
  <StatefulDropdown
    toggleType='dropdown'
    defaultText={
      <span>
        <FilterIcon />
        {'   '}
        Dropdown
      </span>
    }
    isPlain={true}
    items={filterOptions}
  />
);

export const kebab = () => (
  <StatefulDropdown position='left' isPlain={false} items={filterOptions} />
);
