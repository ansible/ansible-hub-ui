import { Tooltip as PFTooltip } from '@patternfly/react-core';
import React, { ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  content: string | ReactNode;
}

// wraps Tooltip to add a span wrap so that disabled elements still get tooltips
export const Tooltip = ({ content, children }: IProps) => (
  <PFTooltip content={content}>
    <span>{children}</span>
  </PFTooltip>
);
