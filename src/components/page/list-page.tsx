import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { ParamHelper, errorMessage, filterIsSet } from 'src/utilities';

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

type CanPermission = (o: { featureFlags; settings; user }) => boolean;
type FilterConfig = { id: string; title: string }[];
type ParamsType = { page?: number; page_size?: number };
type Query<T> = (o: {
  params?: ParamsType;
}) => Promise<{ data: { count: number; results: T[] } }>;
type RenderTableRow<T> = (item: T, index: number) => React.ReactNode;
type SortHeaders = {
  title: string;
  type: string;
  id: string;
  className?: string;
}[];

interface ListPageParams<T> {
  condition: CanPermission;
  defaultPageSize: number;
  displayName: string;
  errorTitle: string;
  filterConfig: FilterConfig;
  noDataDescription: string;
  noDataTitle: string;
  query: Query<T>;
  renderTableRow: RenderTableRow<T>;
  sortHeaders: SortHeaders;
  title: string;
}

export const ListPage = function <T>({
  // { featureFlags, settings, user } => bool
  condition,
  // component name for debugging
  displayName,
  // initial page size
  defaultPageSize,
  // alert on query failure
  errorTitle,
  // filters
  filterConfig,
  // EmptyStateNoData
  noDataDescription,
  noDataTitle,
  // ({ params }) => Promise<{ data: { count, results[] } }>
  query,
  // (item, index) => <tr>...</tr>
  renderTableRow,
  // table headers
  sortHeaders,
  // container title
  title,
}: ListPageParams<T>) {
  const klass = class extends React.Component<RouteComponentProps, IState<T>> {
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

      this.state = {
        alerts: [],
        inputText: '',
        itemCount: 0,
        items: [],
        loading: true,
        params,
        unauthorised: false,
      };
    }

    componentDidMount() {
      if (!condition(this.context)) {
        this.setState({ loading: false, unauthorised: true });
      } else {
        this.query();
      }
    }

    render() {
      const { params, itemCount, loading, items, alerts, unauthorised } =
        this.state;

      const knownFilters = (filterConfig || []).map(({ id }) => id);
      const noData = items.length === 0 && !filterIsSet(params, knownFilters);

      const updateParams = (p) => this.updateParams(p, () => this.query());

      const niceNames = Object.fromEntries(
        (filterConfig || []).map(({ id, title }) => [id, title]),
      );

      return (
        <React.Fragment>
          <AlertList
            alerts={alerts}
            closeAlert={(i) => this.closeAlert(i)}
          ></AlertList>
          <BaseHeader title={title} />
          {unauthorised ? (
            <EmptyStateUnauthorized />
          ) : noData && !loading ? (
            <EmptyStateNoData
              title={noDataTitle}
              description={noDataDescription}
            />
          ) : (
            <Main>
              {loading ? (
                <LoadingPageSpinner />
              ) : (
                <section className='body'>
                  <div className='hub-list-toolbar'>
                    <Toolbar>
                      <ToolbarContent>
                        <ToolbarGroup>
                          <ToolbarItem>
                            <CompoundFilter
                              inputText={this.state.inputText}
                              onChange={(text) =>
                                this.setState({ inputText: text })
                              }
                              updateParams={updateParams}
                              params={params}
                              filterConfig={filterConfig}
                            />
                          </ToolbarItem>
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
                    this.renderTable(params, updateParams)
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

    private renderTable(params, updateParams) {
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
          <tbody>{items.map((item, i) => renderTableRow(item, i))}</tbody>
        </table>
      );
    }

    private get closeAlert() {
      return closeAlertMixin('alerts');
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

    private get updateParams() {
      return ParamHelper.updateParamsMixin();
    }
  };

  return withRouter(klass);
};
