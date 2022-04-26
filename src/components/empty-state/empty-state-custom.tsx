import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { ComponentClass } from 'react';
import { ReactElement, ReactNode } from 'react';

interface IProps {
  icon?: ComponentClass;
  title: string;
  description: ReactNode;
  button?: ReactElement;
  variant?: 'xs' | 'small' | 'large' | 'xl' | 'full';
}

export class EmptyStateCustom extends React.Component<IProps> {
  static defaultProps = {
    variant: 'small',
  };

  render() {
    return (
      <EmptyState variant={EmptyStateVariant[this.props.variant]}>
        <EmptyStateIcon icon={this.props.icon} />
        <Title headingLevel='h4' size='lg'>
          {this.props.title}
        </Title>
        <EmptyStateBody>{this.props.description}</EmptyStateBody>
        {this.props.button && (
          <EmptyStatePrimary>{this.props.button}</EmptyStatePrimary>
        )}
      </EmptyState>
    );
  }
}
