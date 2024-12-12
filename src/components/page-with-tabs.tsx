import { type MessageDescriptor, i18n } from '@lingui/core';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Component, type ReactNode } from 'react';
import { type ActionType } from 'src/actions';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  LinkTabs,
  type LinkTabsProps,
  LoadingSpinner,
  Main,
  closeAlert,
} from 'src/components';
import { NotFound } from 'src/containers/not-found/not-found';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { type PermissionContextType } from 'src/permissions';
import {
  ParamHelper,
  type RouteProps,
  jsxErrorMessage,
  withRouter,
} from 'src/utilities';

interface IState<T> {
  alerts: AlertType[];
  item: T;
  loading: boolean;
  params: {
    tab?: string;
  };
  unauthorized: boolean;
}

// states:
// loading - initial state, only Main + spinner, header and alerts
// unauthorized - only EmptyStateUnauthorized, header and alerts
// (data) - renders detail

interface PageWithTabsParams<T> {
  breadcrumbs: ({ name, tab, params }) => { url?: string; name: string }[];
  condition: PermissionContextType;
  displayName: string;
  errorTitle: MessageDescriptor;
  headerActions?: ActionType[];
  headerDetails?: (item) => ReactNode;
  listUrl: string;
  query: ({ name }) => Promise<T>;
  renderTab: (tab, item, actionContext) => ReactNode;
  tabs: (tab, name) => LinkTabsProps['tabs'];
}

export const PageWithTabs = function <
  T extends { name: string; my_permissions?: string[] },
>({
  // ({ name }) => [{ url?, name }]
  breadcrumbs,
  // { featureFlags, settings, user } => bool
  condition,
  // component name for debugging
  displayName,
  // alert on query failure
  errorTitle,
  // displayed after filters
  headerActions,
  // under title
  headerDetails,
  // formatPath result to navigate to - to get to the list screen
  listUrl,
  // () => Promise<T>
  query,
  renderTab,
  tabs,
}: PageWithTabsParams<T>) {
  const renderModals = (actionContext) => (
    <>
      {headerActions?.length
        ? headerActions.map((action) => action?.modal?.(actionContext))
        : null}
    </>
  );

  const klass = class extends Component<RouteProps, IState<T>> {
    static displayName = displayName;
    static contextType = AppContext;

    constructor(props) {
      super(props);

      const params = ParamHelper.parseParamString(props.location.search);

      if (!params['tab']) {
        params['tab'] = 'details';
      }

      this.state = {
        alerts: [],
        item: null,
        loading: true,
        unauthorized: false,
        params,
      };
    }

    componentDidMount() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!condition(this.context as any)) {
        this.setState({ loading: false, unauthorized: true });
      } else {
        this.query();
      }

      this.setState({ alerts: (this.context as IAppContextType).alerts || [] });
      (this.context as IAppContextType).setAlerts([]);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.location !== this.props.location) {
        const params = ParamHelper.parseParamString(this.props.location.search);
        this.setState({ params: { tab: 'details', ...params } });
      }
    }

    render() {
      const { routeParams } = this.props;
      const { alerts, item, loading, params, unauthorized } = this.state;

      const actionContext = {
        addAlert: (alert) => this.addAlert(alert),
        hasObjectPermission: (permission) =>
          item?.my_permissions?.includes?.(permission),
        hasPermission: (this.context as IAppContextType).hasPermission,
        listQuery: () => this.props.navigate(listUrl),
        navigate: this.props.navigate,
        query: () => this.query(),
        queueAlert: (this.context as IAppContextType).queueAlert,
        setState: (state) => this.setState(state),
        state: this.state,
        user: (this.context as IAppContextType).user,
      };

      const name = item?.name || routeParams.name;
      const tab = params.tab || 'details';

      if (!loading && !unauthorized && !item) {
        return (
          <>
            <AlertList
              alerts={alerts}
              closeAlert={(i) =>
                closeAlert(i, {
                  alerts,
                  setAlerts: (alerts) => this.setState({ alerts }),
                })
              }
            />
            <NotFound />
          </>
        );
      }

      return (
        <>
          <AlertList
            alerts={alerts}
            closeAlert={(i) =>
              closeAlert(i, {
                alerts,
                setAlerts: (alerts) => this.setState({ alerts }),
              })
            }
          />
          <BaseHeader
            title={name}
            breadcrumbs={
              <Breadcrumbs
                links={breadcrumbs({
                  name,
                  tab,
                  params,
                })}
              />
            }
            pageControls={
              loading ? null : (
                <div className='hub-toolbar'>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        {headerActions?.length &&
                          headerActions.map((action) =>
                            action.visible(item, actionContext) ? (
                              <ToolbarItem key={action.title}>
                                {action.button(item, actionContext)}
                              </ToolbarItem>
                            ) : null,
                          )}
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>
                </div>
              )
            }
          >
            {headerDetails?.(item)}
            <div className='hub-tab-link-container'>
              <div className='tabs'>
                <LinkTabs tabs={tabs(tab, name)} />
              </div>
            </div>
          </BaseHeader>
          {renderModals?.(actionContext)}
          {unauthorized ? (
            <EmptyStateUnauthorized />
          ) : (
            <Main>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <section
                  className='body'
                  data-cy={`PageWithTabs-${displayName}-${tab}`}
                >
                  {this.renderTab(tab, actionContext)}
                </section>
              )}
            </Main>
          )}
        </>
      );
    }

    private renderTab(tab, actionContext) {
      const { item } = this.state;
      if (!item) {
        return null;
      }

      return renderTab(tab, item, actionContext);
    }

    private query() {
      const { name } = this.props.routeParams;

      this.setState({ loading: true }, () => {
        query({ name })
          .then((item) => {
            this.setState({
              item,
              loading: false,
            });
          })
          .catch((e) => {
            const { status, statusText } = e.response;
            this.setState({
              loading: false,
              item: null,
            });
            this.addAlert({
              title: i18n._(errorTitle),
              variant: 'danger',
              description: jsxErrorMessage(status, statusText),
            });
          });
      });
    }

    private addAlert(alert: AlertType) {
      let alerts = this.state.alerts;
      if (alert.id) {
        alerts = alerts.filter(({ id }) => id !== alert.id);
      }

      this.setState({
        alerts: [...alerts, alert],
      });
    }

    private updateParams(params, callback = null) {
      ParamHelper.updateParams({
        params,
        navigate: (to) => this.props.navigate(to),
        setState: (state) => this.setState(state, callback),
      });
    }
  };

  return withRouter(klass);
};
