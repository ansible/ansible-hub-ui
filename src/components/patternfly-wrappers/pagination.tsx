import { Trans, t } from '@lingui/macro';
import {
  Pagination as PaginationPF,
  PaginationProps,
} from '@patternfly/react-core';
import React from 'react';

// AAP-3737 - support both "1 - 2 of 3" and "3 的 1 - 2"
const ToggleTemplate = ({
  firstIndex = 0,
  lastIndex = 0,
  itemCount = 0,
}: {
  firstIndex?: number;
  lastIndex?: number;
  itemCount?: number;
}) => (
  <Trans>
    <b>
      {firstIndex} - {lastIndex}
    </b>{' '}
    of <b>{itemCount}</b>
  </Trans>
);

// wraps Pagination for localization
export const Pagination = (props: Omit<PaginationProps, 'ref'>) => {
  const titles = {
    ofWord: t`of`,
    perPageSuffix: t`per page`,
    items: null,
  };

  return (
    <PaginationPF
      titles={titles}
      toggleTemplate={(props) => <ToggleTemplate {...props} />}
      {...props}
    />
  );
};
