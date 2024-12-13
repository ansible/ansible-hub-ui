import { t } from '@lingui/core/macro';
import { Label } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { useState } from 'react';
import { LabelGroup } from 'src/components';
import { useHubContext } from 'src/loaders/app-context';

interface IProps {
  availablePermissions?: string[];
  isDisabled?: boolean;
  isViewOnly?: boolean;
  onCategoryClear?: () => void;
  onPermissionToggle?: (permission: string) => void;
  selectedPermissions: string[];
}

export const PermissionChipSelector = ({
  availablePermissions,
  isDisabled,
  isViewOnly,
  onCategoryClear,
  onPermissionToggle,
  selectedPermissions,
}: IProps) => {
  const [isOpen, setOpen] = useState(false);
  const { model_permissions } = useHubContext().user;

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
      onToggle={(_event, isOpen) => setOpen(isOpen)}
      onSelect={(_event, permission) =>
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
};
