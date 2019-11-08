import * as React from 'react';

import {
    Dropdown,
    DropdownPosition,
    KebabToggle,
    DropdownToggle,
} from '@patternfly/react-core';

interface IProps {
    items: React.ReactNodeArray;
    onSelect?: (event) => void;
    toggleType?: string;
    defaultText?: React.ReactNode;
    position?: 'left' | 'right';
    isPlain?: boolean;
}

interface IState {
    isOpen: boolean;
    selected: string;
}

export class StatefulDropdown extends React.Component<IProps, IState> {
    static defaultProps = {
        isPlain: true,
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
        const {
            items,
            toggleType,
            defaultText,
            position,
            isPlain,
        } = this.props;

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
            default:
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
