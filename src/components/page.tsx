import { MessageDescriptor, i18n } from '@lingui/core';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { Component, ReactNode } from 'react';
import { ActionType } from 'src/actions';
import { LoadingPageSpinner } from 'src/components';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  Main,
  closeAlert,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { PermissionContextType } from 'src/permissions';
import { RouteProps, errorMessage, withRouter } from 'src/utilities';

interface IState<T> {
  alerts: AlertType[];
  item: T;
  loading: boolean;
  unauthorised: boolean;
}

// states:
// loading - initial state, only Main + spinner, header and alerts
// unauthorised - only EmptyStateUnauthorized, header and alerts
// (data) - renders detail

interface PageParams<T> {
  breadcrumbs: ({ name }) => { url?: string; name: string }[];
  condition: PermissionContextType;
  displayName: string;
  errorTitle: MessageDescriptor;
  headerActions?: ActionType[];
  listUrl: string;
  query: ({ name }) => Promise<T>;
  title: ({ name }) => string;
  transformParams: (routeParams) => Record<string, string>;
  render: (item, actionContext) => ReactNode;
}

export const Page = function <
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
  // formatPath result to navigate to - to get to the list screen
  listUrl,
  // () => Promise<T>
  query,
  title,
  transformParams,
  render,
}: PageParams<T>) {
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

      this.state = {
        alerts: [],
        item: null,
        loading: true,
        unauthorised: false,
      };
    }

    componentDidMount() {
      // condition check after query, for object permissions
      this.query().then((item) => {
        const actionContext = {
          ...(this.context as IAppContextType),
          hasObjectPermission: (permission) =>
            item?.my_permissions?.includes?.(permission),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!condition(actionContext as any)) {
          this.setState({ loading: false, unauthorised: true });
        }

        this.setState({
          alerts: (this.context as IAppContextType).alerts || [],
        });
        (this.context as IAppContextType).setAlerts([]);
      });
    }

    render() {
      const { routeParams } = this.props;
      const { alerts, item, loading, unauthorised } = this.state;

      const actionContext = {
        addAlert: (alert) => this.addAlert(alert),
        hasObjectPermission: (permission) =>
          item?.my_permissions?.includes?.(permission),
        hasPermission: (this.context as IAppContextType).hasPermission,
        listQuery: () => this.props.navigate(listUrl),
        navigate: this.props.navigate,
        query: () => this.query(),
        queueAlert: (this.context as IAppContextType).queueAlert,
        setState: (s) => this.setState(s),
        state: this.state,
        user: (this.context as IAppContextType).user,
      };

      const name = item?.name || transformParams(routeParams)?.name || null;

      return (
        <>
          <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
          <BaseHeader
            title={title({ name })}
            breadcrumbs={
              <Breadcrumbs
                links={breadcrumbs({
                  name,
                })}
              />
            }
            pageControls={
              <div className='hub-toolbar'>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      {headerActions?.length &&
                        headerActions.map((action) => (
                          <ToolbarItem key={action.title}>
                            {action.button(item, actionContext)}
                          </ToolbarItem>
                        ))}
                    </ToolbarGroup>
                  </ToolbarContent>
                </Toolbar>
              </div>
            }
          />
          {renderModals?.(actionContext)}
          {unauthorised ? (
            <EmptyStateUnauthorized />
          ) : (
            <Main>
              {loading ? (
                <LoadingPageSpinner />
              ) : (
                <section className='body' data-cy={`Page-${displayName}`}>
                  {render(item, actionContext)}
                </section>
              )}
            </Main>
          )}
        </>
      );
    }

    private query() {
      const { name } = transformParams(this.props.routeParams);

      if (!name) {
        this.setState({ loading: false });
        return Promise.resolve(null);
      }

      return new Promise((resolve, reject) => {
        this.setState({ loading: true }, () => {
          query({ name })
            .then((item) => {
              this.setState({
                item,
                loading: false,
              });
              resolve(item);
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
                description: errorMessage(status, statusText),
              });
              reject();
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

    private closeAlert(index) {
      closeAlert(index, {
        alerts: this.state.alerts,
        setAlerts: (alerts) => this.setState({ alerts }),
      });
    }
  };

  return withRouter(klass);
};
