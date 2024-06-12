import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import React, {
  type ComponentClass,
  type ReactElement,
  type ReactNode,
} from 'react';

interface IProps {
  icon?: ComponentClass;
  title: string;
  description: ReactNode;
  button?: ReactElement;
  variant?: 'xs' | 'small' | 'large' | 'xl' | 'full';
}

export const EmptyStateCustom = ({
  icon,
  title,
  description,
  button,
  variant = 'small',
}: IProps) => {
  return (
    <EmptyState variant={EmptyStateVariant[variant]} data-cy='EmptyState'>
      {icon ? <EmptyStateIcon icon={icon} /> : null}
      <Title headingLevel='h4' size='lg'>
        {title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
      {button && <EmptyStatePrimary>{button}</EmptyStatePrimary>}
    </EmptyState>
  );
};
