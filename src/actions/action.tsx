import { Button, DropdownItem } from '@patternfly/react-core';
import React from 'react';
import { Tooltip } from 'src/components';

type ModalType = ({ addAlert, state, setState, query }) => React.ReactNode;

interface ActionParams {
  buttonVariant?: 'primary' | 'secondary';
  modal?: ModalType;
  onClick: (item, actionContext) => void;
  title: string;
  visible?: (item, actionContext) => boolean;
  disabled?: (item, actionContext) => string | null;
}

export class ActionType {
  title: string;
  button: (item, actionContext) => React.ReactNode | null;
  dropdownItem: (item, actionContext) => React.ReactNode | null;
  modal?: ModalType;
  visible: (item, actionContext) => boolean;
  disabled: (item, actionContext) => string | null;
}

export const Action = ({
  buttonVariant,
  title,
  onClick,
  modal = null,
  visible = () => true,
  disabled = () => null,
}: ActionParams): ActionType => ({
  title,
  button: (item, actionContext) =>
    visible(item, actionContext) ? (
      disabled(item, actionContext) ? (
        <Tooltip content={disabled(item, actionContext)} key={title}>
          <Button variant={buttonVariant} isDisabled>
            {title}
          </Button>
        </Tooltip>
      ) : (
        <Button
          variant={buttonVariant}
          key={title}
          onClick={() => onClick(item, actionContext)}
        >
          {title}
        </Button>
      )
    ) : null,
  dropdownItem: (item, actionContext) =>
    visible(item, actionContext) ? (
      disabled(item, actionContext) ? (
        <DropdownItem
          key={title}
          description={disabled(item, actionContext)}
          isDisabled
        >
          {title}
        </DropdownItem>
      ) : (
        <DropdownItem key={title} onClick={() => onClick(item, actionContext)}>
          {title}
        </DropdownItem>
      )
    ) : null,
  modal,
  visible,
  disabled,
});
