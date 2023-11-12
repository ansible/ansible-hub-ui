import { Trans, t } from '@lingui/macro';
import {
  Pagination as PaginationPF,
  PaginationVariant,
} from '@patternfly/react-core';
import React from 'react';
import { Constants } from 'src/constants';
import { ParamHelper } from 'src/utilities';

interface IProps {
  /** Number of total items returned by the query */
  count: number;

  /** Current page params **/
  params: {
    page_size?: number;
    page?: number;
  };

  /** Sets the current page params to p */
  updateParams: (params) => void;

  /** Applies the correct styling for pagination at the top of the page*/
  isTop?: boolean;

  /** Applies styling to make pagination compact */
  isCompact?: boolean;
}

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

// wraps Pagination for localization and integration with hub flows
// FIXME: split into Pagination wrapper with only isTop & ToggleTemplate..
// ..separate HubPagination with updateParams knowledge
export const Pagination = ({
  count,
  params,
  updateParams,
  isTop,
  isCompact,
}: IProps) => {
  const extraProps = isTop
    ? {}
    : {
        widgetId: 'pagination-options-menu-bottom',
        variant: PaginationVariant.bottom,
      };

  const onSetPage = (_, p) =>
    updateParams(ParamHelper.setParam(params, 'page', p));

  const onPerPageSelect = (_, p) => {
    updateParams({ ...params, page: 1, page_size: p });
  };

  const perPageOptions = Constants.DEFAULT_PAGINATION_OPTIONS.map((option) => ({
    title: String(option),
    value: option,
  }));

  const titles = {
    ofWord: t`of`,
    perPageSuffix: t`per page`,
    items: null,
  };

  return (
    <PaginationPF
      isCompact={isTop || isCompact}
      itemCount={count}
      onPerPageSelect={onPerPageSelect}
      onSetPage={onSetPage}
      page={params.page || 1}
      perPage={params.page_size || Constants.DEFAULT_PAGE_SIZE}
      perPageOptions={perPageOptions}
      titles={titles}
      toggleTemplate={(props) => <ToggleTemplate {...props} />}
      {...extraProps}
    />
  );
};
