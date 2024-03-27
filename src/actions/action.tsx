import { type MessageDescriptor, i18n } from '@lingui/core';
import { Button } from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core';
import React, { type ReactNode } from 'react';
import { Tooltip } from 'src/components';
import { type PermissionContextType } from 'src/permissions';

type ModalType = ({ addAlert, listQuery, query, setState, state }) => ReactNode;

interface ActionParams {
  buttonVariant?: 'primary' | 'secondary';
  condition?: PermissionContextType;
  disabled?: (item, actionContext) => string | ReactNode | null;
  modal?: ModalType;
  onClick: (item, actionContext) => void;
  title: MessageDescriptor;
  visible?: (item, actionContext) => boolean;
}

export class ActionType {
  button: (item, actionContext) => ReactNode | null;
  disabled: (item, actionContext) => string | ReactNode | null;
  dropdownItem: (item, actionContext) => ReactNode | null;
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
