import * as React from 'react';

import {
  Pagination as PaginationPF,
  PaginationVariant,
  ToggleTemplate,
} from '@patternfly/react-core';

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

export class Pagination extends React.Component<IProps> {
  render() {
    const { count, params, updateParams, isTop, perPageOptions, isCompact } =
      this.props;

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
        perPageOptions={this.mapPerPageOptions(
          perPageOptions || Constants.DEFAULT_PAGINATION_OPTIONS,
        )}
        titles={{
          ofWord: _`of`,
          perPageSuffix: _`per page`,
          items: _`items`,
        }}
        toggleTemplate={(props) => <ToggleTemplate ofWord={_`of`} {...props} />}
      />
    );
  }

  private mapPerPageOptions(options) {
    return options.map((option) => ({
      title: String(option),
      value: option,
    }));
  }
}
