import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import React from 'react';
import { EmptyStateCustom } from 'src/components';

interface IProps {
  clearAllFilters?: () => void;
}

export const EmptyStateFilter = (props: IProps) => {
  return (
    <EmptyStateCustom
      title={t`No results found`}
      description={t`No results match the filter criteria. Try changing your filter settings.`}
      icon={SearchIcon}
      button={
        props.clearAllFilters ? (
          <Button onClick={props.clearAllFilters} variant='link'>
            {t`Clear all filters`}
          </Button>
        ) : null
      }
    />
  );
};
