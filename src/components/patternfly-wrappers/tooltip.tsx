import { Tooltip as PFTooltip } from '@patternfly/react-core';
import * as React from 'react';

interface IProps {
  children: React.ReactNode;
  content: string;
}

export class Tooltip extends React.Component<IProps> {
  render() {
    const { content, children } = this.props;
    return (
      <PFTooltip content={content}>
        <span>{children}</span>
      </PFTooltip>
    );
  }
}
