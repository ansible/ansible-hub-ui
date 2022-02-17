import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';

import * as React from 'react';
import {
  Label,
  LabelGroup,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

interface IProps {
  availablePermissions: string[];
  selectedPermissions: string[];
  setSelected: (selected: string[]) => void;
  isDisabled?: boolean;
  isViewOnly?: boolean;
  onSelect?: (event, selection) => void;
  onClear?: () => void;
  menuAppendTo?: 'parent' | 'inline';
  multilingual?: boolean;
}

interface IState {
  isOpen: boolean;
}

export class PermissionChipSelector extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  render() {
    if (this.props.isViewOnly) {
      const items = this.props.selectedPermissions.length
        ? this.props.selectedPermissions
        : [this.placeholderText()];
      return (
        <LabelGroup>
          {items.map((text) => (
            <Label key={text}>
              {this.props.multilingual ? i18n._(text) : text}
            </Label>
          ))}
        </LabelGroup>
      );
    }

    let selections = [];
    if (this.props.multilingual) {
      this.props.selectedPermissions.forEach((item) => {
        let item2 = {};
        // orginal english value
        item2['value'] = item;
        item2.toString = function (): string {
          // translated value
          return i18n._(item);
        };
        selections.push(item2);
      });
    } else {
      selections = this.props.selectedPermissions;
    }

    return (
      <Select
        menuAppendTo={this.props.menuAppendTo}
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel={t`Select permissions`}
        onToggle={this.onToggle}
        onSelect={this.props.onSelect ? this.props.onSelect : this.onSelect}
        onClear={this.props.onClear ? this.props.onClear : this.clearSelection}
        selections={selections}
        isOpen={this.state.isOpen}
        placeholderText={this.placeholderText()}
        isDisabled={!!this.props.isDisabled}
      >
        {this.props.availablePermissions.length === 0
          ? [
              <SelectOption
                isDisabled={true}
                key={'not_found'}
                value={t`Not found`}
              />,
            ]
          : this.props.availablePermissions.map((option, index) => (
              <SelectOption key={index} value={option}>
                {this.props.multilingual ? i18n._(option) : option}
              </SelectOption>
            ))}
      </Select>
    );
  }

  private placeholderText() {
    if (!this.props.isDisabled && !this.props.isViewOnly) {
      return t`Select permissions`;
    }
    return this.props.selectedPermissions.length === 0 ? t`No permission` : '';
  }

  private clearSelection = () => {
    this.props.setSelected([]);
  };

  private onToggle = (isOpen) => {
    this.setState({
      isOpen: isOpen,
    });
  };

  private onSelect = (event, selection) => {
    const newPerms = new Set(this.props.selectedPermissions);
    if (newPerms.has(selection)) {
      newPerms.delete(selection);
    } else {
      newPerms.add(selection);
    }

    this.props.setSelected(Array.from(newPerms));
  };
}
