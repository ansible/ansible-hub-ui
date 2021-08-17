import * as React from 'react';
import { ClipboardCopy as PFClipboardCopy } from '@patternfly/react-core';

interface IProps {
  children: string;
  [key: string]: any;
}

export class ClipboardCopy extends React.Component<IProps, {}> {
  render() {
    const { children, ...props } = this.props;
    return (
      <PFClipboardCopy
        hoverTip={_`Copy to clipboard`}
        clickTip={_`Successfully copied to clipboard!`}
        {...props}
      >
        {children}
      </PFClipboardCopy>
    );
  }
}
