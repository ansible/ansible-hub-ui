import { Tooltip as PFTooltip, TooltipPosition } from '@patternfly/react-core';
import React, { ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: string | TooltipPosition;
}

// wraps Tooltip to add a span wrap so that disabled elements still get tooltips
export const Tooltip = ({ content, children, position }: IProps) => (
  <PFTooltip content={content} position={position as TooltipPosition}>
    <span>{children}</span>
  </PFTooltip>
);
