import { List } from '@patternfly/react-core';
import React from 'react';
import { StatefulDropdown } from '../patternfly-wrappers/stateful-dropdown';

interface IProps {
  kebabItems?: React.ReactNode[];
  buttons?: React.ReactNode[];
}
export const ListItemActions = (props: IProps) => {
  const buttons = props.buttons?.filter(Boolean);
  const kebabItems = props.kebabItems?.filter(Boolean);

  return (
    <td
      style={{
        paddingRight: '0px',
        textAlign: 'right',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {buttons?.length ? (
        <>
          <List>{buttons}</List>{' '}
        </>
      ) : null}
      {kebabItems?.length ? (
        <div data-cy='kebab-toggle'>
          <StatefulDropdown items={kebabItems} />{' '}
        </div>
      ) : null}
    </td>
  );
};
