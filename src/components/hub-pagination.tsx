import { PaginationVariant } from '@patternfly/react-core';
import { Pagination } from 'src/components';
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

export const HubPagination = ({
  count,
  params,
  updateParams,
  isTop,
  isCompact,
}: IProps) => {
  const onSetPage = (_, p) =>
    updateParams(ParamHelper.setParam(params, 'page', p));

  const onPerPageSelect = (_, p) => {
    updateParams({ ...params, page: 1, page_size: p });
  };

  const perPageOptions = [10, 20, 50, 100].map((option) => ({
    title: String(option),
    value: option,
  }));

  return (
    <Pagination
      isCompact={isTop || isCompact}
      itemCount={count}
      onPerPageSelect={onPerPageSelect}
      onSetPage={onSetPage}
      page={params.page || 1}
      perPage={params.page_size || 10}
      perPageOptions={perPageOptions}
      variant={isTop ? PaginationVariant.top : PaginationVariant.bottom}
    />
  );
};
