import { t } from '@lingui/macro';
import { ClipboardCopy as PFClipboardCopy } from '@patternfly/react-core';
import React from 'react';

interface IProps {
  children: string;
  [key: string]: string | number | boolean;
}

export const ClipboardCopy = ({ children, ...props }: IProps) => (
  <PFClipboardCopy
    hoverTip={t`Copy to clipboard`}
    clickTip={t`Successfully copied to clipboard!`}
    {...props}
  >
    {children}
  </PFClipboardCopy>
);
