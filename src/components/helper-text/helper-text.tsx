import { t } from '@lingui/macro';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';
import './helper-text.scss';

interface IProps {
  /** Value to display in the tag */
  content: React.ReactNode;
  header?: React.ReactNode;
}

export const HelperText = (props: IProps) => {
  return (
    <Popover
      aria-label={t`popover example`}
      position={PopoverPosition.top}
      bodyContent={props.content}
      headerContent={props.header}
    >
      <Button iconPosition={'left'} variant={'plain'} className={'helper'}>
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  );
};
