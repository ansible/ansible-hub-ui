import * as React from 'react';

import {
  Pagination as PaginationPF,
  PaginationVariant,
} from '@patternfly/react-core';

import { Constants } from '../../constants';
import { ParamHelper } from '../../utilities/param-helper';

interface IProps {
  count: number;
  params: {
    page_size?: number;
    page?: number;
  };
  updateParams: (params) => void;
  isTop?: boolean;
  isCompact?: boolean;
  perPageOptions?: number[];
}

export class Pagination extends React.Component<IProps> {
  render() {
    const {
      count,
      params,
      updateParams,
      isTop,
      perPageOptions,
      isCompact,
    } = this.props;

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
      />
    );
  }

  private mapPerPageOptions(options) {
    return options.map(option => ({
      title: String(option),
      value: option,
    }));
  }
}
