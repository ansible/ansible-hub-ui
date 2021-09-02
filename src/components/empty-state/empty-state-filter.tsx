import { t } from '@lingui/macro';
import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { EmptyStateCustom } from './empty-state-custom';

interface IProps {
  clearAllFilters?: () => void;
}

export class EmptyStateFilter extends React.Component<IProps> {
  render() {
    return (
      <EmptyStateCustom
        title={t`No results found`}
        description={t`No results match the filter criteria. Try changing your filter settings.`}
        icon={SearchIcon}
        button={
          this.props.clearAllFilters ? (
            <Button onClick={this.props.clearAllFilters} variant='link'>
              {t`Clear all filters`}
            </Button>
          ) : null
        }
      />
    );
  }
}
