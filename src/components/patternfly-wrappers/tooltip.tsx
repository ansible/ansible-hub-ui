import * as React from 'react';
import { Tooltip as PFTooltip } from '@patternfly/react-core';

interface IProps {
  content: string;
}

export class Tooltip extends React.Component<IProps, {}> {
  render() {
    const { content, children } = this.props;
    return (
      <PFTooltip content={content}>
        <span>{children}</span>
      </PFTooltip>
    );
  }
}
