import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
interface IProps {}

export class EmptyStateFilter extends React.Component<IProps> {
  render() {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel='h4' size='lg'>
          No results found
        </Title>
        <EmptyStateBody>
          No results match the filter criteria. Remove all filters or clear all
          filters to show results.
        </EmptyStateBody>
      </EmptyState>
    );
  }
}
