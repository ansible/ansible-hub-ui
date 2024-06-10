import { type MessageDescriptor, i18n } from '@lingui/core';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React from 'react';
import { type ActionType } from 'src/actions';
import {
  AlertList,
  type AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  type FilterOption,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { type PermissionContextType } from 'src/permissions';
import {
  ParamHelper,
  type RouteProps,
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
  selectedFilter: string;
}

// states:
// loading - initial state, only Main + spinner, header and alerts
// unauthorised - only EmptyStateUnauthorized, header and alerts
// noData - no data at all, EmptyStateNoData with possible buttons
// !items.length - no visible data but a filter is on, EmptyStateFilter with a clear filters button, CompoundFilter + AppliedFilters
// (data) - also renders SortTable

interface ParamsType {
  page?: number;
  page_size?: number;
}

export type Query<T> = (o: {
  params?: ParamsType;
}) => Promise<{ data: { count: number; results: T[] } }>;

export type RenderTableRow<T> = (
  item: T,
  index: number,
  { addAlert, setState }: { addAlert; setState? },
  listItemActions?,
) => React.ReactNode;

type RenderModals = ({
  addAlert,
  listQuery,
  query,
  setState,
  state,
}) => React.ReactNode;

type SortHeaders = {
  title: MessageDescriptor;
  type: string;
  id: string;
  className?: string;
}[];

export type LocalizedSortHeaders = {
  title: string;
  type: string;
  id: string;
  className?: string;
}[];

interface ListPageParams<T> {
  condition: PermissionContextType;
  defaultPageSize: number;
  defaultSort?: string;
  displayName: string;
  errorTitle: MessageDescriptor;
  filterConfig: ({ state }) => FilterOption[];
  headerActions?: ActionType[];
  listItemActions?: ActionType[];
  noDataButton?: (item, actionContext) => React.ReactNode;
  noDataDescription: MessageDescriptor;
  noDataTitle: MessageDescriptor;
  query: Query<T>;
  renderModals?: RenderModals;
  renderTableRow: RenderTableRow<T>;
  sortHeaders: SortHeaders;
  title: MessageDescriptor;
  typeaheadQuery?: ({ inputText, selectedFilter, setState }) => void;
}

export const ListPage = function <T>({
  // { featureFlags, settings, user } => bool
  condition,
  // component name for debugging
  displayName,
  // initial page size
  defaultPageSize,
  // initial sort ordering
  defaultSort,
  // alert on query failure
  errorTitle,
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
  // for typeahed filters
  typeaheadQuery,
}: ListPageParams<T>) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translateTitle = ({ title, ...rest }: any) => ({
    ...rest,
    title: i18n._(title),
  });

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
        selectedFilter: null,
        unauthorised: false,
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
    }

    render() {
      const { alerts, itemCount, items, loading, params, unauthorised } =
        this.state;

      const localizedFilterConfig = filterConfig({ state: this.state }) || [];
      const knownFilters = localizedFilterConfig.map(({ id }) => id);
      const noData = items.length === 0 && !filterIsSet(params, knownFilters);

      const updateParams = (p) => this.updateParams(p, () => this.query());

      const niceNames = Object.fromEntries(
        localizedFilterConfig.map(({ id, title }) => [id, title]),
      );

      const niceValues = {};
      localizedFilterConfig
        .filter(({ options }) => options?.length)
        .forEach(({ id: filterId, options }) => {
          const obj = (niceValues[filterId] = {});
          options.forEach(({ id: optionId, title }) => {
            obj[optionId] = title;
          });
        });

      const actionContext = {
        addAlert: (alert) => this.addAlert(alert),
        hasObjectPermission: () => false, // list items don't load my_permissions .. but superadmin should still work
        hasPermission: this.context.hasPermission,
        listQuery: () => this.query(),
        navigate: this.props.navigate,
        query: () => this.query(),
        queueAlert: this.context.queueAlert,
        setState: (s) => this.setState(s),
        state: this.state,
        user: this.context.user,
      };

      const resetCompoundFilter = () =>
        this.setState({
          inputText: '',
          selectedFilter: localizedFilterConfig[0].id,
        });

      return (
        <React.Fragment>
          <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
          <BaseHeader title={i18n._(title)} />
          {renderModals?.(actionContext)}
          {unauthorised ? (
            <EmptyStateUnauthorized />
          ) : noData && !loading ? (
            <EmptyStateNoData
              button={<>{noDataButton?.(null, actionContext)}</>}
              description={i18n._(noDataDescription)}
              title={i18n._(noDataTitle)}
            />
          ) : (
            <Main>
              {loading ? (
                <LoadingPageSpinner />
              ) : (
                <section className='body' data-cy={`ListPage-${displayName}`}>
                  <div className='hub-toolbar'>
                    <Toolbar>
                      <ToolbarContent>
                        <ToolbarGroup>
                          <ToolbarItem>
                            <CompoundFilter
                              inputText={this.state.inputText}
                              onChange={(inputText) => {
                                this.setState({ inputText });

                                if (typeaheadQuery) {
                                  typeaheadQuery({
                                    inputText,
                                    selectedFilter: this.state.selectedFilter,
                                    setState: (s) => this.setState(s),
                                  });
                                }
                              }}
                              updateParams={(p) => {
                                resetCompoundFilter();
                                updateParams(p);
                              }}
                              params={params}
                              filterConfig={localizedFilterConfig}
                              selectFilter={(selectedFilter) => {
                                this.setState({ selectedFilter });

                                if (typeaheadQuery) {
                                  typeaheadQuery({
                                    inputText: '',
                                    selectedFilter,
                                    setState: (s) => this.setState(s),
                                  });
                                }
                              }}
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
                        resetCompoundFilter();
                        updateParams(p);
                      }}
                      params={params}
                      ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                      niceNames={niceNames}
                      niceValues={niceValues}
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

      const localizedSortHeaders = (sortHeaders || []).map(
        translateTitle,
      ) as LocalizedSortHeaders;

      return (
        <table
          aria-label={i18n._(title)}
          className='hub-c-table-content pf-c-table'
        >
          <SortTable
            options={{ headers: localizedSortHeaders }}
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
              title: i18n._(errorTitle),
              variant: 'danger',
              description: errorMessage(status, statusText),
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

    private get closeAlert() {
      return closeAlertMixin('alerts');
    }

    private get updateParams() {
      return ParamHelper.updateParamsMixin();
    }
  };

  return withRouter(klass);
};
