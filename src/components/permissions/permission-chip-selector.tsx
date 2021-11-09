import { t } from '@lingui/macro';
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
  selectPermissionCaption?: string;
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
    let selectPermissionCaption =
      this.props.selectPermissionCaption || t`Select permissions`;

    if (this.props.isViewOnly) {
      const items = this.props.selectedPermissions.length
        ? this.props.selectedPermissions
        : [this.placeholderText(selectPermissionCaption)];
      return (
        <LabelGroup>
          {items.map((text) => (
            <Label key={text}>{text}</Label>
          ))}
        </LabelGroup>
      );
    }

    return (
      <Select
        menuAppendTo={this.props.menuAppendTo}
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel={selectPermissionCaption}
        onToggle={this.onToggle}
        onSelect={!!this.props.onSelect ? this.props.onSelect : this.onSelect}
        onClear={
          !!this.props.onClear ? this.props.onClear : this.clearSelection
        }
        selections={this.props.selectedPermissions}
        isOpen={this.state.isOpen}
        placeholderText={this.placeholderText(selectPermissionCaption)}
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
              <SelectOption key={index} value={option} />
            ))}
      </Select>
    );
  }

  private placeholderText(selectPermissionCaption) {
    if (!this.props.isDisabled && !this.props.isViewOnly) {
      return selectPermissionCaption;
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
