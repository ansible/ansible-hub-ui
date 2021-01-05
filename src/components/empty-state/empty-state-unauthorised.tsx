import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  EmptyStateBody,
  EmptyStatePrimary,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

interface IProps {}

export class EmptyStateUnauthorised extends React.Component<IProps> {
  render() {
    return (
      <EmptyState variant={EmptyStateVariant.xs}>
        <EmptyStateIcon icon={LockIcon} />
        <Title headingLevel='h4'>
          You do not have have access to Automation Hub
        </Title>
        <EmptyStateBody>
          Contact you organization administrator for more information.
        </EmptyStateBody>
      </EmptyState>
    );
  }
}
