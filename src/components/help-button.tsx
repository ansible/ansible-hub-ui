import { Button, PopoverPosition } from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { type ReactNode } from 'react';
import { Popover } from 'src/components';

interface IProps {
  /** Value to display in the tag */
  content: ReactNode;
  hasAutoWidth?: boolean;
  header?: ReactNode;
  prefix?: ReactNode;
}

export const HelpButton = ({
  content,
  hasAutoWidth,
  header,
  prefix,
}: IProps) => (
  <Popover
    bodyContent={content}
    hasAutoWidth={hasAutoWidth}
    headerContent={header}
    position={PopoverPosition.top}
  >
    <Button
      iconPosition='left'
      style={{ padding: 0 }}
      variant={prefix ? 'link' : 'plain'}
    >
      {prefix}
      {prefix ? ' ' : ''}
      <OutlinedQuestionCircleIcon />
    </Button>
  </Popover>
);
