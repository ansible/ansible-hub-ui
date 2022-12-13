import * as React from 'react';
import { Button, DropdownItem } from '@patternfly/react-core';

export const Action = ({ title, onClick }) => ({
  dropdownItem: (item) => (
    <DropdownItem key={title} onClick={() => onClick(item)}>
      {title}
    </DropdownItem>
  ),
  button: (item) => (
    <Button key={title} onClick={() => onClick(item)}>
      {title}
    </Button>
  ),
});
