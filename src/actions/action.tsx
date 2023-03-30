import { Button, DropdownItem } from '@patternfly/react-core';
import React from 'react';
import { Tooltip } from 'src/components';
import { type PermissionContextType } from 'src/permissions';

type ModalType = ({ addAlert, state, setState, query }) => React.ReactNode;

interface ActionParams {
  buttonVariant?: 'primary' | 'secondary';
  condition?: PermissionContextType;
  disabled?: (item, actionContext) => string | null;
  modal?: ModalType;
  onClick: (item, actionContext) => void;
  title: string;
  visible?: (item, actionContext) => boolean;
}

export class ActionType {
  button: (item, actionContext) => React.ReactNode | null;
  disabled: (item, actionContext) => string | null;
  dropdownItem: (item, actionContext) => React.ReactNode | null;
  modal?: ModalType;
  title: string;
  visible: (item, actionContext) => boolean;
}

export const Action = ({
  buttonVariant,
  condition = () => true,
  disabled = () => null,
  modal = null,
  onClick,
  title,
  visible = () => true,
}: ActionParams): ActionType => ({
  title,
  button: (item, actionContext) =>
    condition(actionContext, item) && visible(item, actionContext) ? (
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
    condition(actionContext, item) && visible(item, actionContext) ? (
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
