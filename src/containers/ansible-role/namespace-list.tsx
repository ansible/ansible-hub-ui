import { t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import React from 'react';
import { LegacyNamespaceAPI, LegacyNamespaceListType } from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  LegacyNamespaceListItem,
  LoadingPageSpinner,
  Pagination,
  closeAlertMixin,
} from 'src/components';
import {
  ParamHelper,
  RouteProps,
  filterIsSet,
  handleHttpError,
  withRouter,
} from 'src/utilities';

interface RoleNamespacesState {
  alerts: AlertType[];
  count: number;
  loading: boolean;
  params: {
    page?: number;
    page_size?: number;
    sort?: string;
  };
  roleNamespaces: LegacyNamespaceListType[];
}

class AnsibleRoleNamespaceList extends React.Component<
  RouteProps,
  RoleNamespacesState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.state = {
      alerts: [],
      count: 0,
      loading: true,
      params: {
        page: 1,
        page_size: 10,
        sort: '-created',
        ...params,
      },
      roleNamespaces: [],
    };
  }

  componentDidMount() {
    this.query(this.state.params);
  }

  query(params) {
    this.setState({ loading: true });
    LegacyNamespaceAPI.list(params)
      .then(({ data: { count, results } }) =>
        this.setState({
          count,
          loading: false,
          roleNamespaces: results,
        }),
      )
      .catch(
        handleHttpError(
          t`Failed to load role namespaces`,
          () => this.setState({ loading: false }),
          (alert) => this.addAlert(alert),
        ),
      );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  render() {
    const updateParams = (params) =>
      this.updateParams(params, () => this.query(params));

    const filterConfig = [
      {
        id: 'keywords',
        title: t`Keywords`,
      },
    ];

    const sortOptions = [
      { title: t`Name`, id: 'name', type: 'alpha' as const },
      {
        title: t`Created`,
        id: 'created',
        type: 'numeric' as const,
      },
    ];

    const { alerts, count, loading, params, roleNamespaces } = this.state;

    const noData =
      count === 0 &&
      !filterIsSet(
        params,
        filterConfig.map(({ id }) => id),
      );

    return (
      <div>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <BaseHeader title={t`Role Namespaces`} />
        {loading ? (
          <LoadingPageSpinner />
        ) : noData ? (
          <EmptyStateNoData
            title={t`No role namespaces yet`}
            description={t`Role namespaces will appear once created or roles are imported`}
          />
        ) : (
          <div>
            <HubListToolbar
              count={count}
              filterConfig={filterConfig}
              ignoredParams={['page', 'page_size', 'sort']}
              params={params}
              sortOptions={sortOptions}
              updateParams={updateParams}
            />

            {!count ? (
              <EmptyStateFilter />
            ) : (
              <>
                <DataList aria-label={t`List of role namespaces`}>
                  {roleNamespaces &&
                    roleNamespaces.map((lnamespace) => (
                      <LegacyNamespaceListItem
                        key={lnamespace.id}
                        namespace={lnamespace}
                      />
                    ))}
                </DataList>

                <Pagination
                  count={count}
                  params={params}
                  updateParams={updateParams}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(AnsibleRoleNamespaceList);
