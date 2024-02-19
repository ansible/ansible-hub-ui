import { t } from '@lingui/macro';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import React, { Component } from 'react';
import './helper-text.scss';

interface IProps {
  /** Value to display in the tag */
  content: React.ReactNode;
  header?: React.ReactNode;
  hasAutoWidth?: boolean;
}

export class HelperText extends Component<IProps> {
  render() {
    return (
      <Popover
        aria-label={t`popover example`}
        position={PopoverPosition.top}
        bodyContent={this.props.content}
        headerContent={this.props.header}
        hasAutoWidth={this.props.hasAutoWidth}
      >
        <Button iconPosition={'left'} variant={'plain'} className={'helper'}>
          <OutlinedQuestionCircleIcon />
        </Button>
      </Popover>
    );
  }
}
