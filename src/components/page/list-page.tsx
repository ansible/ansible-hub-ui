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
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  FilterOption,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { PermissionContextType } from 'src/permissions';
import {
  ParamHelper,
  RouteProps,
  errorMessage,
  filterIsSet,
  withRouter,
} from 'src/utilities';

interface IState<T> {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: T[];
  itemCount: number;
  alerts: AlertType[];
  unauthorised: boolean;
  inputText: string;
}

// states:
// loading - initial state, only Main + spinner, header and alerts
// unauthorised - only EmptyStateUnauthorized, header and alerts
// noData - no data at all, EmptyStateNoData with possible buttons
// !items.length - no visible data but a filter is on, EmptyStateFilter with a clear filters button, CompoundFilter + AppliedFilters
// (data) - also renders SortTable

type ParamsType = { page?: number; page_size?: number };
export type Query<T> = (o: {
  params?: ParamsType;
}) => Promise<{ data: { count: number; results: T[] } }>;
export type RenderTableRow<T> = (
  item: T,
  index: number,
  { addAlert, setState = null },
  listItemActions?,
) => React.ReactNode;
type RenderModals = ({ addAlert, state, setState, query }) => React.ReactNode;
export type SortHeaders = {
  title: string;
  type: string;
  id: string;
  className?: string;
}[];

interface ListPageParams<T, ExtraState> {
  condition: PermissionContextType;
  defaultPageSize: number;
  defaultSort?: string;
  didMount?: ({ context, addAlert }) => void;
  displayName: string;
  errorTitle: string;
  extraState?: ExtraState;
  filterConfig: FilterOption[];
  headerActions?: ActionType[];
  listItemActions?: ActionType[];
  noDataButton?: (item, actionContext) => React.ReactNode;
  noDataDescription: string;
  noDataTitle: string;
  query: Query<T>;
  renderModals?: RenderModals;
  renderTableRow: RenderTableRow<T>;
  sortHeaders: SortHeaders;
  title: string;
}

export const ListPage = function <T, ExtraState = Record<string, never>>({
  // { featureFlags, settings, user } => bool
  condition,
  // extra code to run on mount
  didMount,
  // component name for debugging
  displayName,
  // initial page size
  defaultPageSize,
  // initial sort ordering
  defaultSort,
  // alert on query failure
  errorTitle,
  // extra initial state
  extraState,
  // filters
  filterConfig,
  // displayed after filters
  headerActions,
  // only used for modals; renderTableRow handles the rest
  listItemActions,
  // EmptyStateNoData
  noDataButton,
  noDataDescription,
  noDataTitle,
  // ({ params }) => Promise<{ data: { count, results[] } }>
  query,
  // ({ addAlert, state, setState, query }) => <ConfirmationModal... />
  renderModals,
  // (item, index) => <tr>...</tr>
  renderTableRow,
  // table headers
  sortHeaders,
  // container title
  title,
}: ListPageParams<T, ExtraState>) {
  renderModals ||= function (actionContext) {
    return (
      <>
        {headerActions?.length
          ? headerActions.map((action) => action?.modal?.(actionContext))
          : null}
        {listItemActions?.length
          ? listItemActions.map((action) => action?.modal?.(actionContext))
          : null}
      </>
    );
  };

  const klass = class extends React.Component<RouteProps, IState<T>> {
    static displayName = displayName;
    static contextType = AppContext;

    constructor(props) {
      super(props);

      const params = ParamHelper.parseParamString(props.location.search, [
        'page',
        'page_size',
      ]);

      if (!params['page_size']) {
        params['page_size'] = defaultPageSize;
      }

      if (!params['sort'] && defaultSort) {
        params['sort'] = defaultSort;
      }

      this.state = {
        alerts: [],
        inputText: '',
        itemCount: 0,
        items: [],
        loading: true,
        params,
        unauthorised: false,
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

    render() {
      const { alerts, itemCount, items, loading, params, unauthorised } =
        this.state;

      const knownFilters = (filterConfig || []).map(({ id }) => id);
      const noData = items.length === 0 && !filterIsSet(params, knownFilters);

      const updateParams = (p) => this.updateParams(p, () => this.query());

      const niceNames = Object.fromEntries(
        (filterConfig || []).map(({ id, title }) => [id, title]),
      );

      const actionContext = {
        addAlert: (alert) => this.addAlert(alert),
        hasObjectPermission: () => false, // list items don't load my_permissions .. but superadmin should still work
        hasPermission: this.context.hasPermission,
        navigate: this.props.navigate,
        query: () => this.query(),
        queueAlert: this.context.queueAlert,
        setState: (s) => this.setState(s),
        state: this.state,
        user: this.context.user,
      };

      return (
        <React.Fragment>
          <AlertList
            alerts={alerts}
            closeAlert={(i) => this.closeAlert(i)}
          ></AlertList>
          <BaseHeader title={title} />
          {renderModals?.(actionContext)}
          {unauthorised ? (
            <EmptyStateUnauthorized />
          ) : noData && !loading ? (
            <EmptyStateNoData
              button={<>{noDataButton?.(null, actionContext)}</>}
              description={noDataDescription}
              title={noDataTitle}
            />
          ) : (
            <Main>
              {loading ? (
                <LoadingPageSpinner />
              ) : (
                <section className='body' data-cy={`ListPage-${displayName}`}>
                  <div className='hub-list-toolbar'>
                    <Toolbar>
                      <ToolbarContent>
                        <ToolbarGroup>
                          <ToolbarItem>
                            <CompoundFilter
                              inputText={this.state.inputText}
                              onChange={(inputText) =>
                                this.setState({ inputText })
                              }
                              updateParams={updateParams}
                              params={params}
                              filterConfig={filterConfig}
                            />
                          </ToolbarItem>
                          {headerActions?.length &&
                            headerActions.map((action) => (
                              <ToolbarItem key={action.title}>
                                {action.button(null, actionContext)}
                              </ToolbarItem>
                            ))}
                        </ToolbarGroup>
                      </ToolbarContent>
                    </Toolbar>

                    <Pagination
                      params={params}
                      updateParams={updateParams}
                      count={itemCount}
                      isTop
                    />
                  </div>
                  <div>
                    <AppliedFilters
                      updateParams={(p) => {
                        updateParams(p);
                        this.setState({ inputText: '' });
                      }}
                      params={params}
                      ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                      niceNames={niceNames}
                    />
                  </div>
                  {loading ? (
                    <LoadingPageSpinner />
                  ) : (
                    this.renderTable(params, updateParams, actionContext)
                  )}

                  <Pagination
                    params={params}
                    updateParams={updateParams}
                    count={itemCount}
                  />
                </section>
              )}
            </Main>
          )}
        </React.Fragment>
      );
    }

    private renderTable(params, updateParams, actionContext) {
      const { items } = this.state;

      if (!items.length) {
        return <EmptyStateFilter />;
      }

      return (
        <table aria-label={title} className='hub-c-table-content pf-c-table'>
          <SortTable
            options={{ headers: sortHeaders }}
            params={params}
            updateParams={updateParams}
          />
          <tbody>
            {items.map((item, i) => renderTableRow(item, i, actionContext))}
          </tbody>
        </table>
      );
    }

    private query() {
      this.setState({ loading: true }, () => {
        query({ params: this.state.params })
          .then((result) => {
            this.setState({
              items: result.data.results,
              itemCount: result.data.count,
              loading: false,
            });
          })
          .catch((e) => {
            const { status, statusText } = e.response;
            this.setState({
              loading: false,
              items: [],
              itemCount: 0,
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
