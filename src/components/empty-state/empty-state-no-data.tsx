import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

interface IProps {}

export class EmptyStateNoData extends React.Component<IProps> {
  render() {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={AddCircleOIcon} />
        <Title headingLevel='h4' size='lg'>
          No stuff yet
        </Title>
        <EmptyStateBody>Specific message?</EmptyStateBody>
        <EmptyStatePrimary>
          <Button
            variant='primary'
            onClick={() => console.log('TODO redirect to previous page')}
          >
            Specific? Add/Upload
          </Button>
        </EmptyStatePrimary>
      </EmptyState>
    );
  }
}
