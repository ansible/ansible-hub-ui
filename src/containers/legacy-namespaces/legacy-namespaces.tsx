import { t } from '@lingui/macro';
import * as React from 'react';
import './legacy-namespaces.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { DataList } from '@patternfly/react-core';
import {
  BaseHeader,
  CollectionFilter,
  EmptyStateNoData,
  LegacyNamespaceListItem,
  LoadingPageSpinner,
  Pagination,
} from 'src/components';
import { LegacyNamespaceAPI } from 'src/api/legacynamespace';
import { LegacyNamespaceListType } from 'src/api';
import { AppContext } from 'src/loaders/app-context';

interface LegacyNamespacesProps {
  legacynamespaces: LegacyNamespaceListType[];
  loading: boolean;
  mounted: boolean;
  count: number;
  params: {
    page?: number;
    page_size?: number;
    order_by?: string;
    keywords?: string;
  };
  updateParams: (params) => void;
  ignoredParams: string[];
}

class LegacyNamespaces extends React.Component<
  RouteComponentProps,
  LegacyNamespacesProps
> {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      params: {
        page: 1,
        page_size: 10,
        order_by: 'name',
        keywords: null,
      },
      loading: true,
      mounted: false,
      count: 0,
      legacynamespaces: [],
    };
  }

  componentDidMount() {
    const thisQS = window.location.search;
    const urlParams = new URLSearchParams(thisQS);
    const page = parseInt(urlParams.get('page')) || 1;
    const page_size = parseInt(urlParams.get('page_size')) || 10;
    const order_by = urlParams.get('order_by') || 'name';
    const keywords = urlParams.get('keywords') || null;

    LegacyNamespaceAPI.list({
      page: page,
      page_size: page_size,
      order_by: order_by,
      keywords: keywords,
    }).then((response) => {
      this.setState(() => ({
        mounted: true,
        loading: false,
        params: {
          page: page,
          page_size: page_size,
          order_by: order_by,
          keywords: keywords,
        },
        count: response.data.count,
        legacynamespaces: response.data.results,
      }));
    });
  }

  updateParams = (p) => {
    const { page, page_size, order_by, keywords } = p;
    LegacyNamespaceAPI.list({
      page: page,
      page_size: page_size,
      order_by: order_by,
      keywords: keywords,
    }).then((response) => {
      this.setState(() => ({
        mounted: true,
        loading: false,
        params: {
          page: page,
          page_size: page_size,
          order_by: order_by,
          keywords: keywords,
        },
        count: response.data.count,
        legacynamespaces: response.data.results,
      }));
    });
  };

  render() {
    const ignoredParams = [
      'namespace',
      'page',
      'page_size',
      'sort',
      'tag',
      'tags',
      'view_type',
      'order_by',
    ];

    // do not pass null'ish params to the filter widget
    const cleanParams = {};
    for (const [key, value] of Object.entries(this.state.params)) {
      if (ignoredParams.includes(key)) {
        continue;
      }
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    }

    const { loading, legacynamespaces } = this.state;
    const noData = legacynamespaces.length === 0;

    return (
      <div>
        <BaseHeader title={t`Legacy Namespaces`}></BaseHeader>
        <React.Fragment>
          {loading ? (
            <LoadingPageSpinner />
          ) : noData ? (
            <EmptyStateNoData
              title={t`No namespaces yet`}
              description={t`Namespaces will appear once created or roles are imported`}
            />
          ) : (
            <div>
              <CollectionFilter
                ignoredParams={ignoredParams}
                params={cleanParams}
                updateParams={this.updateParams}
              />

              <Pagination
                params={this.state.params}
                updateParams={this.updateParams}
                count={this.state.count}
              />

              <DataList aria-label={t`List of Legacy Namespaces`}>
                {this.state.legacynamespaces &&
                  this.state.legacynamespaces.map((lnamespace) => (
                    <LegacyNamespaceListItem
                      key={lnamespace.id}
                      namespace={lnamespace}
                    />
                  ))}
              </DataList>

              <Pagination
                params={this.state.params}
                updateParams={this.updateParams}
                count={this.state.count}
              />
            </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}

export default withRouter(LegacyNamespaces);

LegacyNamespaces.contextType = AppContext;
