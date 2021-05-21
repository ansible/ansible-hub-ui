import * as React from 'react';
import './tag.scss';

import { Label } from '@patternfly/react-core';

interface IProps {
  /** Value to display in the tag */
  children: string;
}

export class Tag extends React.Component<IProps, {}> {
  render() {
    return <Label className='tag' readOnly>{this.props.children}</Label>;
  }
}
