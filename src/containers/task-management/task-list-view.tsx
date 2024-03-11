import { Trans, t } from '@lingui/macro';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { TaskManagementAPI, TaskType } from 'src/api';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  ConfirmModal,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  HubPagination,
  LoadingSpinner,
  Main,
  SortTable,
  StatusIndicator,
  Tooltip,
  closeAlert,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ParamHelper,
  type RouteProps,
  errorMessage,
  filterIsSet,
  parsePulpIDFromURL,
  translateTask,
  withRouter,
} from 'src/utilities';
import './task.scss';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: TaskType[];
  itemCount: number;
  alerts: AlertType[];
  cancelModalVisible: boolean;
  selectedTask: TaskType;
  unauthorised: boolean;
  inputText: string;
}

export class TaskListView extends Component<RouteProps, IState> {
  static contextType = AppContext;

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
      params,
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
    const { user } = this.context as IAppContextType;
    if (!user || user.is_anonymous) {
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
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        {cancelModalVisible ? this.renderCancelModal() : null}
        <BaseHeader title={t`Task management`} />
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
              <LoadingSpinner />
            ) : (
              <section className='body'>
                <div className='hub-toolbar'>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <CompoundFilter
                            inputText={this.state.inputText}
                            onChange={(text) =>
                              this.setState({ inputText: text })
                            }
                            updateParams={(p) =>
                              this.updateParams(p, () => this.queryTasks())
                            }
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
                  <HubPagination
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
                {loading ? <LoadingSpinner /> : this.renderTable(params)}

                <HubPagination
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
      </>
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
      <Table aria-label={t`Task list`}>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => this.updateParams(p, () => this.queryTasks())}
        />
        <Tbody>{items.map((item, i) => this.renderTableRow(item, i))}</Tbody>
      </Table>
    );
  }

  private renderTableRow(item, index: number) {
    const { name, state, pulp_created, started_at, finished_at, pulp_href } =
      item;
    const taskId = parsePulpIDFromURL(pulp_href);

    return (
      <Tr key={index}>
        <Td>
          <Link to={formatPath(Paths.taskDetail, { task: taskId })}>
            <Tooltip content={translateTask(name)}>{name}</Tooltip>
          </Link>
        </Td>
        <Td>
          <DateComponent date={pulp_created} />
        </Td>
        <Td>
          <DateComponent date={started_at} />
        </Td>
        <Td>
          <DateComponent date={finished_at} />
        </Td>
        <Td>
          <StatusIndicator status={state} />
        </Td>
        <Td>{this.cancelButton(state, item)}</Td>
      </Tr>
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
                selectedTask,
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
                selectedTask,
              })
            }
          >
            {t`Stop task`}
          </Button>
        );
    }
  }

  private renderCancelModal() {
    const { selectedTask } = this.state;
    const name = translateTask(selectedTask.name);

    return (
      <ConfirmModal
        cancelAction={() => this.setState({ cancelModalVisible: false })}
        title={t`Stop task?`}
        confirmAction={() => this.selectedTask(selectedTask, name)}
        confirmButtonTitle={t`Yes, stop`}
      >{t`${name} will be cancelled.`}</ConfirmModal>
    );
  }

  private selectedTask({ pulp_href }, name) {
    TaskManagementAPI.patch(parsePulpIDFromURL(pulp_href), {
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
              description: (
                <Trans>Task &quot;{name}&quot; stopped successfully.</Trans>
              ),
            },
          ],
        });
        this.queryTasks();
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        this.setState({
          loading: true,
          cancelModalVisible: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Task "${name}" could not be stopped.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
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
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            loading: false,
            items: [],
            itemCount: 0,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Tasks list could not be displayed.`,
                description: errorMessage(status, statusText),
              },
            ],
          });
        });
    });
  }

  private addAlert(title, variant, description?) {
    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          description,
          title,
          variant,
        },
      ],
    });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }
}

export default withRouter(TaskListView);
