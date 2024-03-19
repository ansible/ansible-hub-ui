import { t } from '@lingui/macro';
import { Button, DataList } from '@patternfly/react-core';
import React, { Component } from 'react';
import { LegacyRoleAPI, type LegacyRoleListType, TagAPI } from 'src/api';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  HubPagination,
  LoadingSpinner,
  RoleItem,
  closeAlert,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ParamHelper,
  type RouteProps,
  filterIsSet,
  handleHttpError,
  withRouter,
} from 'src/utilities';

interface RolesState {
  alerts: AlertType[];
  count: number;
  loading: boolean;
  params: {
    page?: number;
    page_size?: number;
    sort?: string;
  };
  roles: LegacyRoleListType[];
}

class AnsibleRoleList extends Component<RouteProps, RolesState> {
  static contextType = AppContext;

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
      roles: [],
    };
  }

  componentDidMount() {
    this.setState({ alerts: (this.context as IAppContextType).alerts || [] });
    (this.context as IAppContextType).setAlerts([]);

    this.query(this.state.params);
  }

  query(params) {
    this.setState({ loading: true });
    LegacyRoleAPI.list(params)
      .then(({ data: { count, results } }) =>
        this.setState({
          count,
          loading: false,
          roles: results,
        }),
      )
      .catch(
        handleHttpError(
          t`Failed to load roles`,
          () => this.setState({ loading: false }),
          (alert) => this.addAlert(alert),
        ),
      );
  }

  loadTags(inputText) {
    return TagAPI.listRoles({ name__icontains: inputText, sort: '-count' })
      .then(({ data: { data } }) =>
        data.map(({ name, count }) => ({
          id: name,
          title: count === undefined ? name : t`${name} (${count})`,
        })),
      )
      .catch(() => []);
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  render() {
    const { alerts, count, loading, params, roles } = this.state;
    const { user } = this.context as IAppContextType;

    const updateParams = (params) =>
      this.updateParams(params, () => this.query(params));

    const filterConfig = [
      {
        id: 'keywords',
        title: t`Keywords`,
      },
      {
        id: 'namespace',
        title: t`Namespace`,
      },
      {
        id: 'tags',
        title: t`Tags`,
        inputType: 'typeahead' as const,
        // options handled by `typeaheads`
      },
    ];

    const sortOptions = [
      { title: t`Name`, id: 'name', type: 'alpha' as const },
      {
        title: t`Download count`,
        id: 'download_count',
        type: 'numeric' as const,
      },
      {
        title: t`Created`,
        id: 'created',
        type: 'numeric' as const,
      },
    ];

    const noData =
      count === 0 &&
      !filterIsSet(
        params,
        filterConfig.map(({ id }) => id),
      );

    const canImport = user && !user.is_anonymous;
    const canSync = user?.is_superuser && !IS_COMMUNITY;

    return (
      <div>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        <BaseHeader title={t`Roles`} />
        {loading ? (
          <LoadingSpinner />
        ) : noData ? (
          <EmptyStateNoData
            title={t`No roles yet`}
            description={t`Roles will appear once imported`}
          />
        ) : (
          <div>
            <HubListToolbar
              buttons={[
                canImport && (
                  <Button
                    key='import'
                    onClick={() =>
                      this.props.navigate(
                        formatPath(Paths.standaloneRoleImport),
                      )
                    }
                  >{t`Import role`}</Button>
                ),
                canSync && (
                  <Button
                    key='sync'
                    onClick={() =>
                      this.props.navigate(formatPath(Paths.standaloneRoleSync))
                    }
                  >{t`Sync role`}</Button>
                ),
              ].filter(Boolean)}
              count={count}
              filterConfig={filterConfig}
              ignoredParams={['page', 'page_size', 'sort']}
              params={params}
              sortOptions={sortOptions}
              typeaheads={{ tags: this.loadTags }}
              updateParams={updateParams}
            />

            {!count ? (
              <EmptyStateFilter />
            ) : (
              <>
                <DataList aria-label={t`List of roles`}>
                  {roles &&
                    roles.map((lrole) => (
                      <RoleItem key={lrole.id} role={lrole} show_thumbnail />
                    ))}
                </DataList>

                <HubPagination
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

export default withRouter(AnsibleRoleList);
