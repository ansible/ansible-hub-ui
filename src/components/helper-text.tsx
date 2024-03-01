import { Button, Popover, PopoverPosition } from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import React, { ReactNode } from 'react';
import './helper-text.scss';

interface IProps {
  /** Value to display in the tag */
  content: ReactNode;
  header?: ReactNode;
  hasAutoWidth?: boolean;
}

// FIXME: disambiguate with patternfly HelperText .. pf has inline text, here it's icon + popover text
export const HelperText = ({ content, header, hasAutoWidth }: IProps) => (
  <Popover
    position={PopoverPosition.top}
    bodyContent={content}
    headerContent={header}
    hasAutoWidth={hasAutoWidth}
  >
    <Button iconPosition={'left'} variant={'plain'} className={'helper'}>
      <OutlinedQuestionCircleIcon />
    </Button>
  </Popover>
);
