import * as React from 'react';
import { Button, DropdownItem } from '@patternfly/react-core';

interface ActionParams {
  buttonVariant?: 'primary' | 'secondary';
  modal?: ({ addAlert, state, setState, query }) => React.ReactNode;
  onClick: (item, actionContext) => void;
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
  dropdownItem: (item, actionContext) =>
    visible(item) ? (
      <DropdownItem key={title} onClick={() => onClick(item, actionContext)}>
        {title}
      </DropdownItem>
    ) : null,
  button: (item, actionContext) =>
    visible(item) ? (
      <Button
        variant={buttonVariant}
        key={title}
        onClick={() => onClick(item, actionContext)}
      >
        {title}
      </Button>
    ) : null,
  modal,
});
