import { Tooltip as PFTooltip } from '@patternfly/react-core';
import React from 'react';

interface IProps {
  children: React.ReactNode;
  content: string;
}

export const Tooltip = ({ content, children }: IProps) => (
  <PFTooltip content={content}>
    <span>{children}</span>
  </PFTooltip>
);
