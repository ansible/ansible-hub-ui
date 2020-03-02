import * as React from 'react';
import './tag.scss';

import { Chip } from '@patternfly/react-core';

interface IProps {
  children: string;
}

export class Tag extends React.Component<IProps, {}> {
  render() {
    return (
      <Chip className='tag' isReadOnly>
        {this.props.children}
      </Chip>
    );
  }
}
