import { Trans, t } from '@lingui/macro';
import {
  Pagination as PaginationPF,
  PaginationVariant,
} from '@patternfly/react-core';
import React from 'react';
import { Constants } from 'src/constants';
import { ParamHelper } from 'src/utilities/param-helper';

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

  /** Options for the number of items that can be displayed per page */
  perPageOptions?: number[];
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

export const Pagination = ({
  count,
  params,
  updateParams,
  isTop,
  perPageOptions,
  isCompact,
}: IProps) => {
  const extraProps = {};
  if (!isTop) {
    extraProps['widgetId'] = 'pagination-options-menu-bottom';
    extraProps['variant'] = PaginationVariant.bottom;
  }

  return (
    <PaginationPF
      itemCount={count}
      perPage={params.page_size || Constants.DEFAULT_PAGE_SIZE}
      page={params.page || 1}
      onSetPage={(_, p) =>
        updateParams(ParamHelper.setParam(params, 'page', p))
      }
      onPerPageSelect={(_, p) => {
        updateParams({ ...params, page: 1, page_size: p });
      }}
      {...extraProps}
      isCompact={isTop || isCompact}
      perPageOptions={mapPerPageOptions(
        perPageOptions || Constants.DEFAULT_PAGINATION_OPTIONS,
      )}
      titles={{
        ofWord: t`of`,
        perPageSuffix: t`per page`,
        items: null,
      }}
      toggleTemplate={(props) => <ToggleTemplate {...props} />}
    />
  );
};

function mapPerPageOptions(options) {
  return options.map((option) => ({
    title: String(option),
    value: option,
  }));
}
