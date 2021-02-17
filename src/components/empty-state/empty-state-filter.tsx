import * as React from 'react';
import { SearchIcon } from '@patternfly/react-icons';
import { EmptyStateCustom } from './empty-state-custom';
interface IProps {}

export class EmptyStateFilter extends React.Component<IProps> {
  render() {
    return (
      <EmptyStateCustom
        title={'No results found'}
        description={
          'No results match the filter criteria. Remove all filters or clear all filters to show results.'
        }
        icon={SearchIcon}
      />
    );
  }
}
