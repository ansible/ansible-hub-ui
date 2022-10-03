import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ParamHelper, filterIsSet, errorMessage } from '../../utilities';
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

export const ListPage = function <T>({
  displayName,
  errorTitle,
  filterConfig,
  noDataDescription,
  noDataTitle,
  query,
  renderTableRow,
  sortHeaders,
  title,
}) {
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
        params['page_size'] = 100;
      }

      this.state = {
        params: params,
        items: [],
        loading: true,
        itemCount: 0,
        alerts: [],
        unauthorised: false,
        inputText: '',
      };
    }

    componentDidMount() {
      if (!this.context.user || this.context.user.is_anonymous) {
        this.setState({ loading: false, unauthorised: true });
      } else {
        this.query();
      }
    }

    render() {
      const { params, itemCount, loading, items, alerts, unauthorised } =
        this.state;

      const noData = items.length === 0 && !filterIsSet(params, ['name']);

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
                              updateParams={(p) => {
                                p['page'] = 1;
                                this.updateParams(p, () => this.query());
                              }}
                              params={params}
                              filterConfig={filterConfig}
                            />
                          </ToolbarItem>
                        </ToolbarGroup>
                      </ToolbarContent>
                    </Toolbar>
                    <Pagination
                      params={params}
                      updateParams={(p) =>
                        this.updateParams(p, () => this.query())
                      }
                      count={itemCount}
                      isTop
                    />
                  </div>
                  <div>
                    <AppliedFilters
                      updateParams={(p) => {
                        this.updateParams(p, () => this.query());
                        this.setState({ inputText: '' });
                      }}
                      params={params}
                      ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                      niceNames={{
                        name: t`Name`,
                      }}
                    />
                  </div>
                  {loading ? <LoadingPageSpinner /> : this.renderTable(params)}

                  <Pagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.query())
                    }
                    count={itemCount}
                  />
                </section>
              )}
            </Main>
          )}
        </React.Fragment>
      );
    }

    private renderTable(params) {
      const { items } = this.state;

      if (!items.length) {
        return <EmptyStateFilter />;
      }

      return (
        <table aria-label={title} className='hub-c-table-content pf-c-table'>
          <SortTable
            options={{ headers: sortHeaders }}
            params={params}
            updateParams={(p) => {
              p['page'] = 1;
              this.updateParams(p, () => this.query());
            }}
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
