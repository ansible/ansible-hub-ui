import { Tooltip as PFTooltip, TooltipPosition } from '@patternfly/react-core';
import React, { ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  content: string | ReactNode;
  noSpan?: boolean;
  position?: string | TooltipPosition;
}

// wraps Tooltip to add an optional span wrap so that disabled elements still get tooltips
export const Tooltip = ({ content, children, noSpan, position }: IProps) => (
  <PFTooltip content={content} position={position as TooltipPosition}>
    {noSpan ? <>{children}</> : <span>{children}</span>}
  </PFTooltip>
);
