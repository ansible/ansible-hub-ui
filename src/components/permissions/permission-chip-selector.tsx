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
          {items.map(text => (
            <Label key={text}>{text}</Label>
          ))}
        </LabelGroup>
      );
    }

    return (
      <Select
        menuAppendTo={this.props.menuAppendTo}
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel={_`Select permissions`}
        onToggle={this.onToggle}
        onSelect={!!this.props.onSelect ? this.props.onSelect : this.onSelect}
        onClear={
          !!this.props.onClear ? this.props.onClear : this.clearSelection
        }
        selections={this.props.selectedPermissions}
        isOpen={this.state.isOpen}
        placeholderText={this.placeholderText()}
        isDisabled={!!this.props.isDisabled}
      >
        {this.props.availablePermissions.length === 0
          ? [
              <SelectOption
                isDisabled={true}
                key={'not_found'}
                value={_`Not found`}
              />,
            ]
          : this.props.availablePermissions.map((option, index) => (
              <SelectOption key={index} value={option} />
            ))}
      </Select>
    );
  }

  private placeholderText() {
    if (!this.props.isDisabled && !this.props.isViewOnly) {
      return _`Select permissions`;
    }
    return this.props.selectedPermissions.length === 0 ? _`No permission` : '';
  }

  private clearSelection = () => {
    this.props.setSelected([]);
  };

  private onToggle = isOpen => {
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
