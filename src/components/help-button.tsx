import { Button, PopoverPosition } from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import React, { type ReactNode } from 'react';
import { Popover } from 'src/components';

interface IProps {
  /** Value to display in the tag */
  content: ReactNode;
  header?: ReactNode;
  hasAutoWidth?: boolean;
}

export const HelpButton = ({ content, header, hasAutoWidth }: IProps) => (
  <Popover
    position={PopoverPosition.top}
    bodyContent={content}
    headerContent={header}
    hasAutoWidth={hasAutoWidth}
  >
    <Button iconPosition={'left'} variant={'plain'} style={{ padding: 0 }}>
      <OutlinedQuestionCircleIcon />
    </Button>
  </Popover>
);
