import * as React from 'react';
import * as moment from 'moment';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Tooltip,
} from '@patternfly/react-core';
import { ExecutionEnvironmentAPI, ExecutionEnvironmentType } from 'src/api';
import { filterIsSet, ParamHelper } from 'src/utilities';
import {
  CompoundFilter,
  LoadingPageSpinner,
  AppliedFilters,
  Pagination,
  SortTable,
  AlertList,
  closeAlertMixin,
  AlertType,
  BaseHeader,
  Main,
  EmptyStateFilter,
  EmptyStateNoData,
} from 'src/components';

import { formatPath, Paths } from '../../paths';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: ExecutionEnvironmentType[];
  itemCount: number;
  alerts: AlertType[];
}

class ExecutionEnvironmentList extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      params: params,
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
    };
  }

  componentDidMount() {
    this.queryEnvironments();
  }

  render() {
    const { params, itemCount, loading, alerts, items } = this.state;
    const noData = items.length === 0 && !filterIsSet(params, ['name']);

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={i => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title='Container Registry'></BaseHeader>
        {noData ? (
          <EmptyStateNoData
            title={'No container registries'}
            description={'Container registries will appear once uploaded'}
          />
        ) : (
          <Main>
            <Section className='body'>
              <div className='toolbar'>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <CompoundFilter
                          updateParams={p => {
                            p['page'] = 1;
                            this.updateParams(p, () =>
                              this.queryEnvironments(),
                            );
                          }}
                          params={params}
                          filterConfig={[
                            {
                              id: 'name',
                              title: 'Container repository name',
                            },
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                  </ToolbarContent>
                </Toolbar>

                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryEnvironments())
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={p =>
                    this.updateParams(p, () => this.queryEnvironments())
                  }
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort']}
                />
              </div>
              {loading ? <LoadingPageSpinner /> : this.renderTable(params)}

              <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryEnvironments())
                  }
                  count={itemCount}
                />
              </div>
            </Section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderTable(params) {
    const { items } = this.state;
    if (items.length === 0) {
      return <EmptyStateFilter />;
    }

    let sortTableOptions = {
      headers: [
        {
          title: 'Container repository name',
          type: 'alpha',
          id: 'name',
        },
        {
          title: 'Description',
          type: 'alpha',
          id: 'description',
        },
        {
          title: 'Created',
          type: 'numeric',
          id: 'created',
        },
        {
          title: 'Last modified',
          type: 'alpha',
          id: 'updated',
        },
      ],
    };

    return (
      <table aria-label='User list' className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p =>
            this.updateParams(p, () => this.queryEnvironments())
          }
        />
        <tbody>{items.map((user, i) => this.renderTableRow(user, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(item: any, index: number) {
    const description = item.description;
    return (
      <tr aria-labelledby={item.name} key={index}>
        <td>
          <Link
            to={formatPath(Paths.executionEnvironmentDetail, {
              container: item.name,
            })}
          >
            {item.name}
          </Link>
        </td>
        {description ? (
          <Tooltip content={description}>
            <td className={'pf-m-truncate'}>{description}</td>
          </Tooltip>
        ) : (
          <td></td>
        )}
        <td>{moment(item.created).fromNow()}</td>
        <td>{moment(item.updated).fromNow()}</td>
      </tr>
    );
  }

  private queryEnvironments() {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.list(this.state.params).then(result =>
        this.setState({
          items: result.data.data,
          itemCount: result.data.meta.count,
          loading: false,
        }),
      ),
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(ExecutionEnvironmentList);
