import { List } from '@patternfly/react-core';
import React from 'react';
import { StatefulDropdown } from '../shared/stateful-dropdown';

interface IProps {
  kebabItems?: React.ReactNode[];
  buttons?: React.ReactNode[];
}

export function ListItemActions(props: IProps) {
  const buttons = props.buttons?.filter(Boolean);
  const kebabItems = props.kebabItems?.filter(Boolean);
  const anyButtons = buttons?.length;
  const anyKebab = kebabItems?.length;

  return (
    <td
      style={{
        paddingRight: anyKebab ? '0px' : '16px',
        textAlign: 'right',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {anyButtons ? (
        <>
          <List>{buttons}</List>{' '}
        </>
      ) : null}
      {anyKebab ? (
        <div data-cy='kebab-toggle'>
          <StatefulDropdown items={kebabItems} />{' '}
        </div>
      ) : null}
    </td>
  );
}
