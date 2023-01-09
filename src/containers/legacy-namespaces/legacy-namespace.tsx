import { t } from '@lingui/macro';
import * as React from 'react';
import './legacy-namespace.scss';

import { Link } from 'react-router-dom';
import { RouteProps, withRouter } from 'src/utilities';

import {
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
} from '@patternfly/react-core';

import {
  BaseHeader,
  EmptyStateNoData,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Logo,
  Pagination,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { LegacyRoleAPI } from 'src/api/legacyrole';
import { LegacyNamespaceAPI } from 'src/api/legacynamespace';
import { LegacyNamespaceListType, LegacyRoleListType } from 'src/api';
import { AppContext } from 'src/loaders/app-context';

interface LegacyNamespaceRolesProps {
  namespace: LegacyNamespaceListType;
}

interface LegacyNamespaceRolesState {
  mounted: boolean;
  loading: boolean;
  count: number;
  namespace: LegacyNamespaceListType;
  roles: LegacyRoleListType[];
  params: {
    page?: number;
    page_size?: number;
    order_by?: string;
    keywords?: string;
    tags?: string[];
    view_type?: string;
  };
}

class LegacyNamespaceRoles extends React.Component<
  LegacyNamespaceRolesProps,
  LegacyNamespaceRolesState
> {
  // This is the list of roles that is shown on
  // the legacy namespace details page.

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      loading: true,
      count: 0,
      namespace: props.namespace,
      roles: null,
      params: {
        page: 1,
        page_size: 10,
        order_by: 'created',
      },
    };
  }

  componentDidMount() {
    const namespace = this.state.namespace;
    const thisQS = window.location.search;
    const urlParams = new URLSearchParams(thisQS);
    const page = parseInt(urlParams.get('page'), 10) || 1;
    const page_size = parseInt(urlParams.get('page_size'), 10) || 10;
    const order_by = urlParams.get('order_by') || 'created';

    LegacyRoleAPI.list({
      page: page,
      page_size: page_size,
      order_by: order_by,
      github_user: namespace.name,
    }).then((response) => {
      this.setState(() => ({
        mounted: true,
        loading: false,
        params: {
          page: page,
          page_size: page_size,
          order_by: order_by,
        },
        count: response.data.count,
        namespace: namespace,
        roles: response.data.results,
      }));
    });
  }

  updateParams = (p) => {
    const { page, page_size, order_by } = p;
    const namespace = this.state.namespace;

    LegacyRoleAPI.list({
      page: page,
      page_size: page_size,
      order_by: order_by,
      github_user: namespace.name,
    }).then((response) => {
      this.setState(() => ({
        mounted: true,
        loading: false,
        params: {
          page: page,
          page_size: page_size,
          order_by: order_by,
        },
        count: response.data.count,
        namespace: namespace,
        roles: response.data.results,
      }));
    });
  };

  render() {
    const { loading, roles } = this.state;
    const noData = roles === null || roles.length === 0;

    return (
      <div>
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
              <DataList aria-label={t`List of Legacy Roles`}>
                {this.state.roles.map((lrole, ix) => (
                  <LegacyRoleListItem
                    key={ix}
                    role={lrole}
                    show_thumbnail={false}
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

interface LegacyNamespaceProps {
  loading: boolean;
  namespaceid: number;
  namespace: LegacyNamespaceListType;
  itemCount: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
  };
  updateParams: (params) => void;
  ignoredParams: string[];
}

class LegacyNamespace extends React.Component<
  RouteProps,
  LegacyNamespaceProps
> {
  // This is the details page for a legacy namespace

  constructor(props) {
    super(props);
    const namespaceid = props.routeParams.namespaceid;
    this.state = {
      ...props,
      loading: true,
      namespaceid: namespaceid,
      namespace: null,
      roles: null,
    };
  }

  componentDidMount() {
    LegacyNamespaceAPI.get('namespaces/' + this.state.namespaceid).then(
      (response) => {
        // set the user
        this.setState(() => ({
          loading: false,
          namespace: response.data,
        }));
      },
    );
  }

  render() {
    if (this.state.loading === true) {
      return <LoadingPageSpinner />;
    }

    const infocells = [];

    const namespace_url = formatPath(Paths.legacyNamespace, {
      namespaceid: this.state.namespace.id,
    });

    if (this.state.namespace !== undefined) {
      infocells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns-logo'>
          <Logo
            alt='avatar url'
            fallbackToDefault
            image={this.state.namespace.avatar_url}
            size='90px'
            unlockWidth
            width='90px'
          ></Logo>
          <Link to={namespace_url}>{this.state.namespace.name}</Link>
        </DataListCell>,
      );

      infocells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns-name'>
          <BaseHeader title={this.state.namespace.name}></BaseHeader>
        </DataListCell>,
      );
    }

    return (
      <React.Fragment>
        <DataList aria-label={t`Namespace Header`}>
          <DataListItem data-cy='LegacyNamespace'>
            <DataListItemRow>
              <DataListItemCells dataListCells={infocells} />
            </DataListItemRow>
          </DataListItem>
        </DataList>

        <LegacyNamespaceRoles namespace={this.state.namespace} />
      </React.Fragment>
    );
  }
}

export default withRouter(LegacyNamespace);

LegacyNamespace.contextType = AppContext;
