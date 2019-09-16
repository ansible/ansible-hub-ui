import * as React from 'react';

import {
    Dropdown,
    DropdownPosition,
    KebabToggle,
} from '@patternfly/react-core';

interface IProps {
    items: React.ReactNodeArray;
    onSelect?: (event) => void;
}

interface IState {
    isOpen: boolean;
}

export class StatefulDropdown extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
        };
    }

    render() {
        const { isOpen } = this.state;
        const { items } = this.props;

        return (
            <Dropdown
                onSelect={e => this.onSelect(e)}
                toggle={<KebabToggle onToggle={e => this.onToggle(e)} />}
                isOpen={isOpen}
                isPlain
                dropdownItems={items}
                position={DropdownPosition.right}
                autoFocus={false}
            />
        );
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
            },
            () => {
                if (this.props.onSelect) {
                    this.props.onSelect(event);
                }
            },
        );
    }
}
