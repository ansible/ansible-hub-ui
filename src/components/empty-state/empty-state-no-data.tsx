import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { AddCircleOIcon, SearchIcon } from '@patternfly/react-icons';
import { ReactElement } from 'react';

interface IProps {
  button?: ReactElement;
  title?: string;
  description?: string;
}

export class EmptyStateNoData extends React.Component<IProps> {
  render() {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon
          icon={this.props.button ? AddCircleOIcon : SearchIcon}
        />
        <Title headingLevel='h4' size='lg'>
          {this.props.title ? this.props.title : 'No stuff yet'}
        </Title>
        <EmptyStateBody>
          {this.props.description
            ? this.props.description
            : 'Specific message?'}
        </EmptyStateBody>
        {this.props.button && (
          <EmptyStatePrimary>{this.props.button}</EmptyStatePrimary>
        )}
      </EmptyState>
    );
  }
}
