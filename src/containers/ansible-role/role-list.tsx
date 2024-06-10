import { t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import React from 'react';
import { LegacyRoleAPI, type LegacyRoleListType, TagAPI } from 'src/api';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Pagination,
  closeAlertMixin,
} from 'src/components';
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

class AnsibleRoleList extends React.Component<RouteProps, RolesState> {
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
    const { alerts, count, loading, params, roles } = this.state;

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

    return (
      <div>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <BaseHeader title={t`Roles`} />
        {loading ? (
          <LoadingPageSpinner />
        ) : noData ? (
          <EmptyStateNoData
            title={t`No roles yet`}
            description={t`Roles will appear once imported`}
          />
        ) : (
          <div>
            <HubListToolbar
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
                      <LegacyRoleListItem
                        key={lrole.id}
                        role={lrole}
                        show_thumbnail
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

export default withRouter(AnsibleRoleList);
