import * as React from 'react';
import './task.scss';
import { Constants } from 'src/constants';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Label,
} from '@patternfly/react-core';
import { ParamHelper, filterIsSet } from '../../utilities';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  SyncAltIcon,
  OutlinedClockIcon,
} from '@patternfly/react-icons';
import {
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
} from 'src/components';
import { TaskManagementAPI } from 'src/api';
import { TaskType } from 'src/api/response-types/task';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: Array<TaskType>;
  itemCount: number;
}

export class TaskListView extends React.Component<RouteComponentProps, IState> {
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
      params['sort'] = 'created_by';
    }

    this.state = {
      params: params,
      items: [],
      loading: true,
      itemCount: 0,
    };
  }

  componentDidMount() {
    this.queryTasks();
  }

  render() {
    const { params, itemCount, loading, items } = this.state;
    const noData =
      items.length === 0 && !filterIsSet(params, ['name__contains', 'state']);

    return (
      <React.Fragment>
        <BaseHeader title={_`Task Management`} />
        {noData && !loading ? (
          <EmptyStateNoData
            title={_`No tasks yet`}
            description={_`Tasks will appear once created.`}
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingPageSpinner />
            ) : (
              <section className='body'>
                <div className='task-list'>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <CompoundFilter
                            updateParams={(p) => {
                              p['page'] = 1;
                              this.updateParams(p, () => this.queryTasks());
                            }}
                            params={params}
                            filterConfig={[
                              {
                                id: 'name__contains',
                                title: _`Task name`,
                              },
                              {
                                id: 'state',
                                title: _`Status`,
                                inputType: 'select',
                                options: [
                                  {
                                    id: 'completed',
                                    title: _`Completed`,
                                  },
                                  {
                                    id: 'failed',
                                    title: _`Failed`,
                                  },
                                  {
                                    id: 'running',
                                    title: _`Running`,
                                  },
                                  {
                                    id: 'waiting',
                                    title: _`Waiting`,
                                  },
                                ],
                              },
                            ]}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>
                  <Pagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryTasks())
                    }
                    count={itemCount}
                    isTop
                  />
                </div>
                <div>
                  <AppliedFilters
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryTasks())
                    }
                    params={params}
                    ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                    niceNames={{
                      name__contains: _`Task name`,
                      state: _`Status`,
                    }}
                  />
                </div>
                {this.renderTable(params)}
                <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                  <Pagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryTasks())
                    }
                    count={itemCount}
                  />
                </div>
              </section>
            )}
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
          title: _`Task name`,
          type: 'alpha',
          id: 'name',
        },
        {
          title: _`Created on`,
          type: 'numeric',
          id: 'pulp_created',
        },
        {
          title: _`Started at`,
          type: 'numeric',
          id: 'started_at',
        },
        {
          title: _`Finished at`,
          type: 'numeric',
          id: 'finished_at',
        },
        {
          title: _`Status`,
          type: 'alpha',
          id: 'state',
        },
      ],
    };

    return (
      <table aria-label={_`Task list`} className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => {
            p['page'] = 1;
            this.updateParams(p, () => this.queryTasks());
          }}
        />
        <tbody>{items.map((item, i) => this.renderTableRow(item, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(item: any, index: number) {
    const { name, state, pulp_created, started_at, finished_at } = item;
    return (
      <tr aria-labelledby={name} key={index}>
        <td>{Constants.TASK_NAMES[name] || name}</td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <td>
          <DateComponent date={started_at} />
        </td>
        <td>
          <DateComponent date={finished_at} />
        </td>
        {this.statusLabel({ state })}
      </tr>
    );
  }

  private statusLabel({ state }) {
    switch (state) {
      case 'completed':
        return (
          <td>
            <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
              {state}
            </Label>
          </td>
        );
      case 'failed':
        return (
          <td>
            <Label
              variant='outline'
              color='red'
              icon={<ExclamationCircleIcon />}
            >
              {state}
            </Label>
          </td>
        );
      case 'running':
        return (
          <td>
            <Label variant='outline' color='blue' icon={<SyncAltIcon />}>
              {state}
            </Label>
          </td>
        );
      case 'waiting':
        return (
          <td>
            <Label variant='outline' color='grey' icon={<OutlinedClockIcon />}>
              {state}
            </Label>
          </td>
        );
      default:
        return (
          <td>
            <Label variant='outline'>{state}</Label>
          </td>
        );
    }
  }

  private queryTasks() {
    this.setState({ loading: true }, () => {
      TaskManagementAPI.list(this.state.params).then((result) => {
        this.setState({
          items: result.data.results,
          itemCount: result.data.count,
          loading: false,
        });
      });
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(TaskListView);
