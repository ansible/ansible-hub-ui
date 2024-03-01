import { t } from '@lingui/macro';
import { Label } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import React, { Component } from 'react';
import { LabelGroup } from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';

interface IProps {
  availablePermissions?: string[];
  selectedPermissions: string[];
  isDisabled?: boolean;
  isViewOnly?: boolean;
  onCategoryClear?: () => void;
  onPermissionToggle?: (permission: string) => void;
}

interface IState {
  isOpen: boolean;
}

export class PermissionChipSelector extends Component<IProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  render() {
    const { model_permissions } = (this.context as IAppContextType).user;
    const {
      availablePermissions,
      isDisabled,
      isViewOnly,
      onCategoryClear,
      onPermissionToggle,
      selectedPermissions,
    } = this.props;
    const { isOpen } = this.state;

    if (isViewOnly) {
      const items = selectedPermissions.map((permission) => ({
        label: model_permissions[permission]?.name || permission,
        value: permission,
      }));

      return (
        <LabelGroup>
          {items.length ? null : (
            <Label key='placeholder'>{t`No permission`}</Label>
          )}
          {items.map((text) => (
            <Label key={text.value} title={text.value}>
              {text.label}
            </Label>
          ))}
        </LabelGroup>
      );
    }

    // { value: 'galaxy.foo', toString: () => "View foo (translated)" }
    const selections = selectedPermissions.map((permission) => ({
      value: permission,
      toString: () => model_permissions[permission]?.name || permission,
    }));

    return (
      <Select
        menuAppendTo='inline'
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel={t`Select permissions`}
        onToggle={(_event, isOpen) => this.setState({ isOpen })}
        onSelect={(event, permission) =>
          onPermissionToggle(permission['value'] || permission)
        }
        onClear={() => onCategoryClear()}
        selections={selections}
        isOpen={isOpen}
        placeholderText={
          !isDisabled && !isViewOnly
            ? t`Select permissions`
            : selectedPermissions.length === 0
              ? t`No permission`
              : ''
        }
        isDisabled={!!isDisabled}
      >
        {availablePermissions.length === 0
          ? [<SelectOption isDisabled key={'not_found'} value={t`Not found`} />]
          : availablePermissions.map((permission) => (
              <SelectOption key={permission} value={permission}>
                {model_permissions[permission]?.name || permission}
              </SelectOption>
            ))}
      </Select>
    );
  }
}
