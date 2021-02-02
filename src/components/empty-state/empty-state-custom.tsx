import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { ComponentClass } from 'react';

interface IProps {
  icon?: ComponentClass;
  title: string;
  description: string;
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
      </EmptyState>
    );
  }
}
