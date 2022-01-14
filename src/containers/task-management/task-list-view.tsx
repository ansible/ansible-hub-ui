import { t, Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';

import * as React from 'react';
import './task.scss';
import { Constants } from 'src/constants';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  Button,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
} from '@patternfly/react-core';
import { ParamHelper, filterIsSet } from '../../utilities';
import { parsePulpIDFromURL } from 'src/utilities/parse-pulp-id';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  closeAlertMixin,
  ConfirmModal,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  Tooltip,
  StatusIndicator,
} from 'src/components';
import { TaskManagementAPI } from 'src/api';
import { TaskType } from 'src/api/response-types/task';
import { formatPath, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: Array<TaskType>;
  itemCount: number;
  alerts: AlertType[];
  cancelModalVisible: boolean;
  selectedTask: TaskType;
  unauthorised: boolean;
  inputText: string;
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
      params['sort'] = '-pulp_created';
    }

    this.state = {
      params: params,
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
      cancelModalVisible: false,
      selectedTask: null,
      unauthorised: false,
      inputText: '',
    };
  }

  componentDidMount() {
    if (!this.context.user || this.context.user.is_anonymous) {
      this.setState({ loading: false, unauthorised: true });
    } else {
      this.queryTasks();
    }
  }

  render() {
    const {
      params,
      itemCount,
      loading,
      items,
      alerts,
      cancelModalVisible,
      unauthorised,
    } = this.state;

    const noData =
      items.length === 0 && !filterIsSet(params, ['name__contains', 'state']);

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {cancelModalVisible ? this.renderCancelModal() : null}
        <BaseHeader title={t`Task Management`} />
        {unauthorised ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`No tasks yet`}
            description={t`Tasks will appear once created.`}
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingPageSpinner />
            ) : (
              <section className='body'>
                <div className='hub-task-list'>
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
                              this.updateParams(p, () => this.queryTasks());
                            }}
                            params={params}
                            filterConfig={[
                              {
                                id: 'name__contains',
                                title: t`Task name`,
                              },
                              {
                                id: 'state',
                                title: t`Status`,
                                inputType: 'select',
                                options: [
                                  {
                                    id: 'completed',
                                    title: t`Completed`,
                                  },
                                  {
                                    id: 'failed',
                                    title: t`Failed`,
                                  },
                                  {
                                    id: 'running',
                                    title: t`Running`,
                                  },
                                  {
                                    id: 'waiting',
                                    title: t`Waiting`,
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
                    updateParams={(p) => {
                      this.updateParams(p, () => this.queryTasks());
                      this.setState({ inputText: '' });
                    }}
                    params={params}
                    ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                    niceNames={{
                      name__contains: t`Task name`,
                      state: t`Status`,
                    }}
                  />
                </div>
                {loading ? <LoadingPageSpinner /> : this.renderTable(params)}

                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryTasks())
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
    if (items.length === 0) {
      return <EmptyStateFilter />;
    }
    const sortTableOptions = {
      headers: [
        {
          title: t`Task name`,
          type: 'alpha',
          id: 'name',
        },
        {
          title: t`Created on`,
          type: 'numeric',
          id: 'pulp_created',
        },
        {
          title: t`Started at`,
          type: 'numeric',
          id: 'started_at',
        },
        {
          title: t`Finished at`,
          type: 'numeric',
          id: 'finished_at',
        },
        {
          title: t`Status`,
          type: 'alpha',
          id: 'state',
        },
      ],
    };

    return (
      <table
        aria-label={t`Task list`}
        className='hub-c-table-content pf-c-table'
      >
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

  private renderTableRow(item, index: number) {
    const { name, state, pulp_created, started_at, finished_at, pulp_href } =
      item;
    const taskId = parsePulpIDFromURL(pulp_href);
    return (
      <tr aria-labelledby={name} key={index}>
        <td>
          <Link to={formatPath(Paths.taskDetail, { task: taskId })}>
            <Tooltip
              content={
                (Constants.TASK_NAMES[name] &&
                  i18n._(Constants.TASK_NAMES[name])) ||
                name
              }
            >
              {name}
            </Tooltip>
          </Link>
        </td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <td>
          <DateComponent date={started_at} />
        </td>
        <td>
          <DateComponent date={finished_at} />
        </td>
        <td>
          <StatusIndicator status={state} />
        </td>
        <td>{this.cancelButton(state, item)}</td>
      </tr>
    );
  }

  private cancelButton(state, selectedTask) {
    switch (state) {
      case 'running':
        return (
          <Button
            variant='secondary'
            aria-label={t`Delete`}
            key='delete'
            onClick={() =>
              this.setState({
                cancelModalVisible: true,
                selectedTask: selectedTask,
              })
            }
          >
            {t`Stop task`}
          </Button>
        );
      case 'waiting':
        return (
          <Button
            variant='secondary'
            aria-label={t`Delete`}
            key='delete'
            onClick={() =>
              this.setState({
                cancelModalVisible: true,
                selectedTask: selectedTask,
              })
            }
          >
            {t`Stop task`}
          </Button>
        );
    }
  }

  private renderCancelModal() {
    const name =
      Constants.TASK_NAMES[this.state.selectedTask.name] ||
      this.state.selectedTask.name;
    return (
      <ConfirmModal
        cancelAction={() => this.setState({ cancelModalVisible: false })}
        title={t`Stop task?`}
        confirmAction={() => this.selectedTask(this.state.selectedTask, name)}
        confirmButtonTitle={t`Yes, stop`}
      >{t`${name} will be cancelled.`}</ConfirmModal>
    );
  }

  private selectedTask(task, name) {
    TaskManagementAPI.patch(parsePulpIDFromURL(task.pulp_href), {
      state: 'canceled',
    })
      .then(() => {
        this.setState({
          loading: true,
          selectedTask: null,
          cancelModalVisible: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'success',
              title: name,
              description: <Trans>Task <b>{name}</b> stopped successfully.</Trans>,
            },
          ],
        });
        this.queryTasks();
      })
      .catch(() =>
        this.setState({
          loading: true,
          cancelModalVisible: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: name,
              description: t`Error stopping task.`,
            },
          ],
        }),
      );
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private queryTasks() {
    this.setState({ loading: true }, () => {
      TaskManagementAPI.list(this.state.params)
        .then((result) => {
          this.setState({
            items: result.data.results,
            itemCount: result.data.count,
            loading: false,
          });
        })
        .catch((e) =>
          this.setState({
            loading: false,
            items: [],
            itemCount: 0,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Error loading tasks.`,
                description: e?.message,
              },
            ],
          }),
        );
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(TaskListView);

TaskListView.contextType = AppContext;
