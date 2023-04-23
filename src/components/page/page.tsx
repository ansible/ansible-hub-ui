import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React from 'react';
import { ActionType } from 'src/actions';
import { LoadingPageSpinner } from 'src/components';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
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

type RenderModals = ({ addAlert, state, setState, query }) => React.ReactNode;

interface PageParams<T, ExtraState> {
  breadcrumbs: ({ name }) => { url?: string; name: string }[];
  condition: PermissionContextType;
  didMount?: ({ context, addAlert }) => void;
  displayName: string;
  errorTitle: string;
  extraState?: ExtraState;
  headerActions?: ActionType[];
  query: ({ name }) => Promise<T>;
  title: ({ name }) => string;
  transformParams: (routeParams) => Record<string, string>;
  renderModals?: RenderModals;
  render: (item, actionContext) => React.ReactNode;
}

export const Page = function <
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
  // () => Promise<T>
  query,
  title,
  transformParams,
  // ({ addAlert, state, setState, query }) => <ConfirmationModal... />
  renderModals,
  render,
}: PageParams<T, ExtraState>) {
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

      this.state = {
        alerts: [],
        item: null,
        loading: true,
        unauthorised: false,
        ...extraState,
      };
    }

    componentDidMount() {
      // condition check after query, for object permissions
      this.query().then((item) => {
        const actionContext = {
          ...this.context,
          hasObjectPermission: (permission) =>
            item?.my_permissions?.includes?.(permission),
        };
        if (!condition(actionContext)) {
          this.setState({ loading: false, unauthorised: true });
        }

        this.setState({ alerts: this.context.alerts || [] });
        this.context.setAlerts([]);

        if (didMount) {
          didMount({
            context: this.context,
            addAlert: (alert) => this.addAlert(alert),
          });
        }
      });
    }

    render() {
      const { routeParams } = this.props;
      const { alerts, item, loading, unauthorised } = this.state;

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

      const name = item?.name || transformParams(routeParams)?.name || null;

      return (
        <React.Fragment>
          <AlertList
            alerts={alerts}
            closeAlert={(i) => this.closeAlert(i)}
          ></AlertList>
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
              <div className='hub-list-toolbar'>
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
        </React.Fragment>
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
                title: errorTitle,
                variant: 'danger',
                description: errorMessage(status, statusText),
              });
              reject();
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
  };

  return withRouter(klass);
};
