import axios from 'axios';
import * as React from 'react';
import * as moment from 'moment';
import './task.scss';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Label,
} from '@patternfly/react-core';
import { ParamHelper } from '../../utilities';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  SyncAltIcon,
  OutlinedClockIcon,
} from '@patternfly/react-icons';
import {
  AlertList,
  AlertType,
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
  Tooltip,
  closeAlertMixin,
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
  alerts: AlertType[];
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
    this.queryTasks();
  }

  render() {
    const { params, itemCount, loading, alerts, items } = this.state;

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    return (
      <React.Fragment>
        <BaseHeader title={'Task Management'} />
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
                          updateParams={p => {
                            p['page'] = 1;
                            this.updateParams(p, () => this.queryTasks());
                          }}
                          params={params}
                          filterConfig={[
                            {
                              id: 'name',
                              title: 'Task name',
                            },
                            {
                              id: 'state',
                              title: 'Status',
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
                    this.updateParams(p, () => this.queryTasks())
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={p =>
                    this.updateParams(p, () => this.queryTasks())
                  }
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                />
              </div>
              {this.renderTable(params)}
              <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryTasks())
                  }
                  count={itemCount}
                />
              </div>
            </section>
          )}
        </Main>
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
          title: 'Task name',
          type: 'alpha',
          id: 'name',
        },
        {
          title: 'Created on',
          type: 'numeric',
          id: 'pulp_created',
        },
        {
          title: 'Started at',
          type: 'numeric',
          id: 'started_at',
        },
        {
          title: 'Finished at',
          type: 'numeric',
          id: 'finished_at',
        },
        {
          title: 'Status',
          type: 'alpha',
          id: 'state',
        },
      ],
    };

    return (
      <table aria-label='Task list' className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p => this.updateParams(p, () => this.queryTasks())}
        />
        <tbody>{items.map((item, i) => this.renderTableRow(item, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(item: any, index: number) {
    const { name, state, pulp_created, started_at, finished_at } = item;
    return (
      <tr aria-labelledby={name} key={index}>
        <td>{name}</td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <td>
          <DateComponent date={started_at} />
        </td>
        <td>
          <DateComponent date={finished_at} />
        </td>
        {state === 'failed' ? (
          <td>
            <Label
              variant='outline'
              color='red'
              icon={<ExclamationCircleIcon />}
            >
              {state}
            </Label>
          </td>
        ) : state === 'completed' ? (
          <td>
            <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
              {state}
            </Label>
          </td>
        ) : state === 'running' ? (
          <td>
            <Label variant='outline' color='blue' icon={<SyncAltIcon />}>
              {state}
            </Label>
          </td>
        ) : state === 'waiting' ? (
          <td>
            <Label variant='outline' color='grey' icon={<OutlinedClockIcon />}>
              {state}
            </Label>
          </td>
        ) : (
          <td>
            <Label variant='outline'>{state}</Label>
          </td>
        )}
      </tr>
    );
  }

  private queryTasks() {
    this.setState({ loading: true }, () => {
      TaskManagementAPI.list(this.state.params).then(result => {
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
