import * as React from 'react';
import { Popover, PopoverPosition, Button } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

interface IProps {
  /** Value to display in the tag */
  content: string;
}

export class HelperText extends React.Component<IProps, {}> {
  render() {
    return (
      <Popover
        aria-label='popover example'
        position={PopoverPosition.top}
        bodyContent={this.props.content}
      >
        <Button iconPosition={'left'} variant={'plain'} padding={'0px'}>
          <OutlinedQuestionCircleIcon />
        </Button>
      </Popover>
    );
  }
}
