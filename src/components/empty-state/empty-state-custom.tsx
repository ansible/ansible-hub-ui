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
import { ReactElement } from 'react';

interface IProps {
  icon?: ComponentClass;
  title: string;
  description: string;
  button?: ReactElement;
}

export class EmptyStateCustom extends React.Component<IProps> {
  render() {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
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
