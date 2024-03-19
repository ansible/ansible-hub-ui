import { List } from '@patternfly/react-core';
import { Td } from '@patternfly/react-table';
import React, { type ReactNode } from 'react';
import { StatefulDropdown } from 'src/components';

interface IProps {
  kebabItems?: ReactNode[];
  buttons?: ReactNode[];
}

export function ListItemActions(props: IProps) {
  const buttons = props.buttons?.filter(Boolean);
  const kebabItems = props.kebabItems?.filter(Boolean);
  const anyButtons = buttons?.length;
  const anyKebab = kebabItems?.length;

  return (
    <Td
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
    </Td>
  );
}
