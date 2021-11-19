import * as React from 'react';
import { t } from '@lingui/macro';
import { Popover, PopoverPosition, Button } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import './helper-text.scss';

interface IProps {
  /** Value to display in the tag */
  content: React.ReactNode;
}

export class HelperText extends React.Component<IProps, {}> {
  render() {
    let div = <div style={{ height: '10px' }}></div>;
    return (
      <Popover
        aria-label={t`popover example`}
        position={PopoverPosition.top}
        bodyContent={this.props.content}
        headerContent={div}
      >
        <Button iconPosition={'left'} variant={'plain'} className={'helper'}>
          <OutlinedQuestionCircleIcon />
        </Button>
      </Popover>
    );
  }
}
