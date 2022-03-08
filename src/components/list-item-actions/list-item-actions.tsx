import React from "react";
import { StatefulDropdown } from "../patternfly-wrappers/stateful-dropdown";

interface IProps {
    items: any[];
    isKebab: boolean
}
export class ListItemActions extends React.Component<IProps> {

    render() {
        return (
            <td style={{ paddingRight: '0px', textAlign: 'right' }}>
                {this.props.isKebab ? <StatefulDropdown items={this.props.items.filter(Boolean)} /> : this.props.items.filter(Boolean)}
            </td>
        )
    }
}