import { Label } from '@patternfly/react-core';
import * as React from 'react';
import './tag.scss';

interface IProps {
  /** Value to display in the tag */
  children: string;
}

export class Tag extends React.Component<IProps> {
  render() {
    return (
      <Label className='hub-c-label-tag' readOnly data-cy='tag'>
        {this.props.children}
      </Label>
    );
  }
}
