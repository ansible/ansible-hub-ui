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
import { LockedIcon } from '@patternfly/react-icons';

interface IProps {}

export class EmptyStateUnauthorised extends React.Component<IProps> {
  render() {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={LockedIcon} />
        <Title headingLevel='h4' size='lg'>
          You do not have have access to TODO: get correct name
        </Title>
        <EmptyStateBody>
          Contact you organization administrator for more information.
        </EmptyStateBody>
        <EmptyStatePrimary>
          <Button
            variant='primary'
            onClick={() => console.log('TODO redirect to previous page')}
          >
            Return to previous page
          </Button>
        </EmptyStatePrimary>
      </EmptyState>
    );
  }
}
