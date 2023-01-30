import { Button, DropdownItem } from '@patternfly/react-core';
import React from 'react';

type ModalType = ({ addAlert, state, setState, query }) => React.ReactNode;

interface ActionParams {
  buttonVariant?: 'primary' | 'secondary';
  modal?: ModalType;
  onClick: (item, actionContext) => void;
  title: string;
  visible?: (item) => boolean;
}

export class ActionType {
  title: string;
  button: (item, actionContext) => React.ReactNode | null;
  dropdownItem: (item, actionContext) => React.ReactNode | null;
  modal?: ModalType;
  visible: (item) => boolean;
}

export const Action = ({
  buttonVariant,
  title,
  onClick,
  modal = null,
  visible = () => true,
}: ActionParams): ActionType => ({
  title,
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
  dropdownItem: (item, actionContext) =>
    visible(item) ? (
      <DropdownItem key={title} onClick={() => onClick(item, actionContext)}>
        {title}
      </DropdownItem>
    ) : null,
  modal,
  visible,
});
