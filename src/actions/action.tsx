import { MessageDescriptor, i18n } from '@lingui/core';
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
  title: MessageDescriptor;
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
  title: i18n._(title),
  button: (item, actionContext) =>
    condition(actionContext, item) && visible(item, actionContext) ? (
      disabled(item, actionContext) ? (
        <Tooltip content={disabled(item, actionContext)} key={i18n._(title)}>
          <Button variant={buttonVariant} isDisabled>
            {i18n._(title)}
          </Button>
        </Tooltip>
      ) : (
        <Button
          variant={buttonVariant}
          key={i18n._(title)}
          onClick={() => onClick(item, actionContext)}
        >
          {i18n._(title)}
        </Button>
      )
    ) : null,
  dropdownItem: (item, actionContext) =>
    condition(actionContext, item) && visible(item, actionContext) ? (
      disabled(item, actionContext) ? (
        <DropdownItem
          key={i18n._(title)}
          description={disabled(item, actionContext)}
          isDisabled
        >
          {i18n._(title)}
        </DropdownItem>
      ) : (
        <DropdownItem
          key={i18n._(title)}
          onClick={() => onClick(item, actionContext)}
        >
          {i18n._(title)}
        </DropdownItem>
      )
    ) : null,
  modal,
  visible,
  disabled,
});
