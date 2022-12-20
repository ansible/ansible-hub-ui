import * as React from 'react';
import { Button, DropdownItem } from '@patternfly/react-core';

interface ActionParams {
  buttonVariant?: 'primary' | 'secondary';
  modal?: ({ addAlert, state, setState, query }) => React.ReactNode;
  onClick: (item, { setState }) => void;
  title: string;
  visible?: (item) => boolean;
}

export const Action = ({
  buttonVariant,
  title,
  onClick,
  modal = null,
  visible = () => true,
}: ActionParams) => ({
  dropdownItem: (item, { setState }) =>
    visible(item) ? (
      <DropdownItem key={title} onClick={() => onClick(item, { setState })}>
        {title}
      </DropdownItem>
    ) : null,
  button: (item, { setState }) =>
    visible(item) ? (
      <Button
        variant={buttonVariant}
        key={title}
        onClick={() => onClick(item, { setState })}
      >
        {title}
      </Button>
    ) : null,
  modal,
});
