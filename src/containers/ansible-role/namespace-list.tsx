import { t } from '@lingui/macro';
import { Button, DataList } from '@patternfly/react-core';
import React, { Component } from 'react';
import { LegacyNamespaceAPI, LegacyNamespaceListType } from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  HubPagination,
  LegacyNamespaceListItem,
  LoadingPageSpinner,
  RoleNamespaceEditModal,
  RoleNamespaceModal,
  WisdomModal,
  closeAlert,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import {
  ParamHelper,
  RouteProps,
  filterIsSet,
  handleHttpError,
  withRouter,
} from 'src/utilities';

interface RoleNamespacesState {
  alerts: AlertType[];
  createModal?: boolean;
  count: number;
  editModal?: LegacyNamespaceListType;
  lightspeedModal?: string;
  loading: boolean;
  params: {
    page?: number;
    page_size?: number;
    sort?: string;
  };
  roleNamespaces: LegacyNamespaceListType[];
}

class AnsibleRoleNamespaceList extends Component<
  RouteProps,
  RoleNamespacesState
> {
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
      createModal: false,
      editModal: null,
      lightspeedModal: null,
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
    this.setState({ alerts: (this.context as IAppContextType).alerts || [] });
    (this.context as IAppContextType).setAlerts([]);

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

  private closeAlert(index) {
    closeAlert(index, {
      alerts: this.state.alerts,
      setAlerts: (alerts) => this.setState({ alerts }),
    });
  }

  render() {
    const updateParams = (params) =>
      this.updateParams(params, () => this.query(params));

    const filterConfig = [
      {
        id: 'keywords',
        title: t`Keywords`,
      },
      { id: 'provider', title: t`Provider`, hidden: true },
    ];

    const sortOptions = [
      { title: t`Name`, id: 'name', type: 'alpha' as const },
      {
        title: t`Created`,
        id: 'created',
        type: 'numeric' as const,
      },
    ];

    const {
      alerts,
      count,
      createModal,
      editModal,
      lightspeedModal,
      loading,
      params,
      roleNamespaces,
    } = this.state;

    const {
      user: { is_superuser: canCreate },
    } = this.context as IAppContextType;

    const noData =
      count === 0 &&
      !filterIsSet(
        params,
        filterConfig.map(({ id }) => id),
      );

    return (
      <div>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        {createModal && (
          <RoleNamespaceModal
            addAlert={(alert) => this.addAlert(alert)}
            onClose={() => this.setState({ createModal: false })}
            onSaved={() => {
              this.setState({ createModal: false });
              this.query(params);
            }}
          />
        )}
        {lightspeedModal && (
          <WisdomModal
            addAlert={(alert) => this.addAlert(alert)}
            closeAction={() => this.setState({ lightspeedModal: null })}
            reference={lightspeedModal}
            scope={'legacy_namespace'}
          />
        )}
        {editModal && (
          <RoleNamespaceEditModal
            addAlert={(alert) => this.addAlert(alert)}
            closeAction={() => this.setState({ editModal: null })}
            namespace={editModal}
          />
        )}
        <BaseHeader title={t`Role namespaces`} />
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
              buttons={[
                canCreate && (
                  <Button
                    key='create'
                    onClick={() => this.setState({ createModal: true })}
                  >{t`Create`}</Button>
                ),
              ].filter(Boolean)}
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
                        openEditModal={(namespace) =>
                          this.setState({ editModal: namespace })
                        }
                        openWisdomModal={({ name }) =>
                          this.setState({ lightspeedModal: name })
                        }
                      />
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

export default withRouter(AnsibleRoleNamespaceList);
