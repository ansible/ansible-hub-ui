import * as React from 'react';

import {
  Dropdown,
  DropdownPosition,
  KebabToggle,
  DropdownToggle,
} from '@patternfly/react-core';

interface IProps {
  /** List of patternfly DropdownItem components */
  items: React.ReactNodeArray;

  /** Callback fired when the user selects an item */
  onSelect?: (event) => void;

  /** If not specified, dropdown button will be a kebab. icon simply removes the dropdown indicator */
  toggleType?: 'dropdown' | 'icon' | 'kebab';

  /** Text to display on the component when it's not expanded*/
  defaultText?: React.ReactNode;

  /** Specifies if the dropdown should be aligned to the left or the right of the toggle button*/
  position?: 'left' | 'right';

  /** Toggles between plain and normal patternfly styling */
  isPlain?: boolean;
}

interface IState {
  isOpen: boolean;
  selected: string;
}

export class StatefulDropdown extends React.Component<IProps, IState> {
  static defaultProps = {
    isPlain: true,
    toggleType: 'kebab',
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      selected: undefined,
    };
  }

  render() {
    const { isOpen } = this.state;
    const { items, toggleType, defaultText, position, isPlain } = this.props;

    return (
      <Dropdown
        onSelect={e => this.onSelect(e)}
        toggle={this.renderToggle(toggleType, defaultText)}
        isOpen={isOpen}
        isPlain={isPlain}
        dropdownItems={items}
        position={position || DropdownPosition.right}
        autoFocus={false}
      />
    );
  }

  private renderToggle(toggleType, defaultText) {
    switch (toggleType) {
      case 'dropdown':
        return (
          <DropdownToggle onToggle={e => this.onToggle(e)}>
            {this.state.selected
              ? this.state.selected
              : defaultText || 'Dropdown'}
          </DropdownToggle>
        );
      case 'icon':
        return (
          <DropdownToggle
            toggleIndicator={null}
            onToggle={e => this.onToggle(e)}
          >
            {this.state.selected
              ? this.state.selected
              : defaultText || 'Dropdown'}
          </DropdownToggle>
        );
      case 'kebab':
        return <KebabToggle onToggle={e => this.onToggle(e)} />;
    }
  }

  private onToggle(isOpen) {
    this.setState({
      isOpen,
    });
  }

  private onSelect(event) {
    this.setState(
      {
        isOpen: !this.state.isOpen,
        selected: event.currentTarget.value,
      },
      () => {
        if (this.props.onSelect) {
          this.props.onSelect(event);
        }
      },
    );
  }
}
