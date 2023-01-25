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
  Tabs,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { PermissionContextType } from 'src/permissions';
import {
  ParamHelper,
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
  breadcrumbs: ({ name, tab }) => { url?: string; name: string }[];
  condition: PermissionContextType;
  didMount?: ({ context, addAlert }) => void;
  displayName: string;
  errorTitle: string;
  extraState?: ExtraState;
  headerActions?: ActionType[];
  query: ({ name }) => Promise<T>;
  renderModals?: RenderModals;
  renderTab: any;
  tabs: { id: string; name: string }[];
}

export const PageWithTabs = function <
  T extends { name: string },
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
  // ({ addAlert, state, setState, query }) => <ConfirmationModal... />
  renderModals,
  renderTab,
  // [{ id, name }]
  tabs,
}: PageWithTabsParams<T, ExtraState>) {
  const klass = class extends React.Component<RouteProps, IState<T>> {
    static displayName = displayName;
    static contextType = AppContext;

    constructor(props) {
      super(props);

      const params = ParamHelper.parseParamString(props.location.search, [
        'tab',
      ]);

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

      if (didMount) {
        didMount({
          context: this.context,
          addAlert: (alert) => this.addAlert(alert),
        });
      }
    }

    render() {
      const { routeParams } = this.props;
      const { alerts, item, loading, params, unauthorised } = this.state;

      const actionContext = {
        addAlert: (alert) => this.addAlert(alert),
        navigate: this.props.navigate,
        query: () => this.query(),
        setState: (s) => this.setState(s),
        state: this.state,
      };

      const name = item?.name || routeParams.name;
      const tab = tabs.find((t) => t.id == params.tab) || tabs[0];

      return (
        <React.Fragment>
          <AlertList
            alerts={alerts}
            closeAlert={(i) => this.closeAlert(i)}
          ></AlertList>
          <BaseHeader
            title={name}
            breadcrumbs={
              <Breadcrumbs
                links={breadcrumbs({
                  name,
                  tab,
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
          >
            <div className='hub-tab-link-container'>
              <div className='tabs'>
                <Tabs
                  tabs={tabs}
                  params={params}
                  updateParams={(p) => this.updateParams(p)}
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

      return renderTab(tab, item, actionContext) || <div>TODO {tab}</div>;
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
