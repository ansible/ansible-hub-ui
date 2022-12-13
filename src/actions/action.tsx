import * as React from 'react';
import { Button, DropdownItem } from '@patternfly/react-core';

interface ActionParams {
  buttonVariant?: 'primary' | 'secondary';
  onClick: (item) => void;
  title: string;
  visible?: (item) => boolean;
}

export const Action = ({
  buttonVariant,
  title,
  onClick,
  visible = () => true,
}: ActionParams) => ({
  dropdownItem: (item) =>
    visible(item) ? (
      <DropdownItem key={title} onClick={() => onClick(item)}>
        {title}
      </DropdownItem>
    ) : null,
  button: (item) =>
    visible(item) ? (
      <Button variant={buttonVariant} key={title} onClick={() => onClick(item)}>
        {title}
      </Button>
    ) : null,
});
