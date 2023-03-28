import { t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import * as React from 'react';
import { LegacyRoleListType } from 'src/api';
import { LegacyRoleAPI } from 'src/api/legacyrole';
import {
  BaseHeader,
  CollectionFilter,
  EmptyStateNoData,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Pagination,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, withRouter } from 'src/utilities';
import './legacy-roles.scss';

interface IProps {
  legacyroles: LegacyRoleListType[];
  mounted: boolean;
  loading: boolean;
  count: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
    order_by?: string;
  };
  updateParams: (params) => void;
  ignoredParams: string[];
}

class LegacyRoles extends React.Component<RouteProps, IProps> {
  // This is the main roles page

  constructor(props) {
    super(props);
    this.state = {
      ...props,
      params: {
        page: 1,
        page_size: 10,
        order_by: 'created',
        keywords: null,
      },
      loading: true,
      mounted: false,
      count: 0,
      legacyroles: [],
    };
  }

  componentDidMount() {
    const thisQS = window.location.search;
    const urlParams = new URLSearchParams(thisQS);
    this.updateParams({
      page: parseInt(urlParams.get('page'), 10) || 1,
      page_size: parseInt(urlParams.get('page_size'), 10) || 10,
      order_by: urlParams.get('order_by') || 'created',
      keywords: urlParams.get('keywords'),
      tags: urlParams.get('tags'),
    });
  }

  updateParams = (p) => {
    const { page, page_size, order_by, keywords, tags } = p;
    this.setState({ loading: true }, () => {
      LegacyRoleAPI.list({
        page: page,
        page_size: page_size,
        order_by: order_by,
        tags: tags,
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
            tags: tags,
          },
          count: response.data.count,
          legacyroles: response.data.results,
        }));
      });
    });
  };

  render() {
    const { loading, legacyroles } = this.state;

    // prevent these params from showing up in the filter widget
    const ignoredParams = [
      'order_by',
      'namespace',
      'repository__name',
      'page',
      'page_size',
      'sort',
      'view_type',
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

    // this seems tricky to get right ...
    const noData =
      !loading &&
      cleanParams['keywords'] === undefined &&
      cleanParams['tag'] == undefined &&
      legacyroles.length == 0;

    return (
      <div>
        <BaseHeader title={t`Legacy Roles`}></BaseHeader>
        <React.Fragment>
          {loading ? (
            <LoadingPageSpinner />
          ) : noData ? (
            <EmptyStateNoData
              title={t`No roles yet`}
              description={t`Roles will appear once imported`}
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
                //updateParams={(p) => this.updateParams(p)}
                updateParams={this.updateParams}
                count={this.state.count}
              />

              <DataList aria-label={t`List of Legacy Roles`}>
                {this.state.legacyroles &&
                  this.state.legacyroles.map((lrole) => (
                    <LegacyRoleListItem
                      key={lrole.github_user + lrole.name + lrole.id}
                      role={lrole}
                      show_thumbnail={true}
                    />
                  ))}
              </DataList>

              <Pagination
                params={this.state.params}
                //updateParams={(p) => this.updateParams(p)}
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

export default withRouter(LegacyRoles);

LegacyRoles.contextType = AppContext;
