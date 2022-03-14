import { List } from '@patternfly/react-core';
import React from 'react';
import { StatefulDropdown } from '../patternfly-wrappers/stateful-dropdown';

interface IProps {
  kebabItems?: React.ReactNode[];
  buttons?: React.ReactNode[];
}
export class ListItemActions extends React.Component<IProps> {
  render() {
    return (
      <td
        style={{
          paddingRight: '0px',
          textAlign: 'right',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        {this.props.buttons?.length && <List>{this.props.buttons} </List>}
        {this.props.kebabItems?.length && (
          <div data-cy='kebab-toggle'>
            <StatefulDropdown items={this.props.kebabItems.filter(Boolean)} />{' '}
          </div>
        )}
      </td>
    );
  }
}
