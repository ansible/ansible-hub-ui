import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React from 'react';
import { ActionType } from 'src/actions';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  LoadingPageSpinner,
  Main,
  Tabs,
  closeAlertMixin,
} from 'src/components';
import { NotFound } from 'src/containers/not-found/not-found';
import { AppContext } from 'src/loaders/app-context';
import { PermissionContextType } from 'src/permissions';
import {
  ParamHelper,
  ParamType,
  RouteProps,
  errorMessage,
  withRouter,
} from 'src/utilities';

interface IState<T> {
  alerts: AlertType[];
  item: T;
  loading: boolean;
  params: {
    tab?: string;
  };
  unauthorised: boolean;
}

// states:
// loading - initial state, only Main + spinner, header and alerts
// unauthorised - only EmptyStateUnauthorized, header and alerts
// (data) - renders detail

type RenderModals = ({ addAlert, state, setState, query }) => React.ReactNode;

interface PageWithTabsParams<T, ExtraState> {
  breadcrumbs: ({ name, tab, params }) => { url?: string; name: string }[];
  condition: PermissionContextType;
  didMount?: ({ context, addAlert }) => void;
  displayName: string;
  errorTitle: string;
  extraState?: ExtraState;
  headerActions?: ActionType[];
  headerDetails?: (item) => React.ReactNode;
  query: ({ name }) => Promise<T>;
  renderModals?: RenderModals;
  renderTab: (tab, item, actionContext) => React.ReactNode;
  tabs: { id: string; name: string }[];
  tabUpdateParams?: (params: ParamType) => ParamType;
}

export const PageWithTabs = function <
  T extends { name: string; my_permissions?: string[] },
  ExtraState = Record<string, never>,
>({
  // ({ name }) => [{ url?, name }]
  breadcrumbs,
  // { featureFlags, settings, user } => bool
  condition,
  // extra code to run on mount
  didMount,
  // component name for debugging
  displayName,
  // alert on query failure
  errorTitle,
  // extra initial state
  extraState,
  // displayed after filters
  headerActions,
  // under title
  headerDetails,
  // () => Promise<T>
  query,
  // ({ addAlert, state, setState, query }) => <ConfirmationModal... />
  renderModals,
  renderTab,
  // [{ id, name }]
  tabs,
  // params => params
  tabUpdateParams,
}: PageWithTabsParams<T, ExtraState>) {
  renderModals ||= function (actionContext) {
    return (
      <>
        {headerActions?.length
          ? headerActions.map((action) => action?.modal?.(actionContext))
          : null}
      </>
    );
  };

  const klass = class extends React.Component<RouteProps, IState<T>> {
    static displayName = displayName;
    static contextType = AppContext;

    constructor(props) {
      super(props);

      const params = ParamHelper.parseParamString(props.location.search);

      if (!params['tab']) {
        params['tab'] = tabs[0].id;
      }

      this.state = {
        alerts: [],
        item: null,
        loading: true,
        unauthorised: false,
        params,
        ...extraState,
      };
    }

    componentDidMount() {
      if (!condition(this.context)) {
        this.setState({ loading: false, unauthorised: true });
      } else {
        this.query();
      }

      this.setState({ alerts: this.context.alerts || [] });
      this.context.setAlerts([]);

      if (didMount) {
        didMount({
          context: this.context,
          addAlert: (alert) => this.addAlert(alert),
        });
      }
    }

    componentDidUpdate(prevProps) {
      if (prevProps.location !== this.props.location) {
        const params = ParamHelper.parseParamString(this.props.location.search);
        this.setState({ params: { tab: tabs[0].id, ...params } });
      }
    }

    render() {
      const { routeParams } = this.props;
      const { alerts, item, loading, params, unauthorised } = this.state;

      const actionContext = {
        addAlert: (alert) => this.addAlert(alert),
        hasObjectPermission: (permission) =>
          item?.my_permissions?.includes?.(permission),
        hasPermission: this.context.hasPermission,
        navigate: this.props.navigate,
        query: () => this.query(),
        queueAlert: this.context.queueAlert,
        setState: (s) => this.setState(s),
        state: this.state,
        user: this.context.user,
      };

      const name = item?.name || routeParams.name;
      const tab = tabs.find((t) => t.id == params.tab) || tabs[0];

      if (!loading && !unauthorised && !item) {
        return (
          <>
            <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
            <NotFound />
          </>
        );
      }

      return (
        <React.Fragment>
          <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
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
                <div className='hub-list-toolbar'>
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
                <Tabs
                  tabs={tabs}
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(tabUpdateParams ? tabUpdateParams(p) : p)
                  }
                />
              </div>
            </div>
          </BaseHeader>
          {renderModals?.(actionContext)}
          {unauthorised ? (
            <EmptyStateUnauthorized />
          ) : (
            <Main>
              {loading ? (
                <LoadingPageSpinner />
              ) : (
                <section
                  className='body'
                  data-cy={`PageWithTabs-${displayName}-${params.tab}`}
                >
                  {this.renderTab(params.tab, actionContext)}
                </section>
              )}
            </Main>
          )}
        </React.Fragment>
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
              title: errorTitle,
              variant: 'danger',
              description: errorMessage(status, statusText),
            });
          });
      });
    }

    private addAlert(alert: AlertType) {
      this.setState({
        alerts: [...this.state.alerts, alert],
      });
    }

    private get closeAlert() {
      return closeAlertMixin('alerts');
    }

    private get updateParams() {
      return ParamHelper.updateParamsMixin();
    }
  };

  return withRouter(klass);
};
