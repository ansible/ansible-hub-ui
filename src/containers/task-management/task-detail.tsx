import { Trans, t } from '@lingui/macro';
import {
  Button,
  CodeBlock,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { capitalize } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { GenericPulpAPI, TaskManagementAPI, type TaskType } from 'src/api';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  Breadcrumbs,
  ConfirmModal,
  DateComponent,
  EmptyStateCustom,
  LoadingSpinner,
  Main,
  StatusIndicator,
  closeAlert,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import {
  type RouteProps,
  jsxErrorMessage,
  parsePulpIDFromURL,
  translateTask,
  withRouter,
} from 'src/utilities';
import './task.scss';

interface IState {
  alerts: AlertType[];
  cancelModalVisible: boolean;
  childTasks: TaskType[];
  loading: boolean;
  parentTask: TaskType;
  polling: ReturnType<typeof setInterval>;
  redirect: string;
  resources: {
    name?: string;
    pluginName?: string;
    type: string;
  }[];
  task: TaskType;
  taskName: string;
}

class TaskDetail extends Component<RouteProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
      cancelModalVisible: false,
      childTasks: [],
      loading: true,
      parentTask: null,
      polling: null,
      redirect: null,
      resources: [],
      task: null,
      taskName: '',
    };
  }

  componentDidMount() {
    this.loadContent();
  }

  componentWillUnmount() {
    if (this.state.polling) {
      clearInterval(this.state.polling);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.routeParams.task !== this.props.routeParams.task) {
      this.setState({ loading: true });
      this.loadContent();
    }
  }

  render() {
    const {
      alerts,
      cancelModalVisible,
      childTasks,
      loading,
      parentTask,
      redirect,
      resources,
      task,
      taskName,
    } = this.state;

    const breadcrumbs = [
      { url: formatPath(Paths.taskList), name: t`Task management` },
      { name: task ? taskName : '' },
    ];
    const parentTaskId = parentTask
      ? parsePulpIDFromURL(parentTask.pulp_href)
      : null;

    if (redirect) {
      return <Navigate to={redirect} />;
    }

    return loading ? (
      <LoadingSpinner />
    ) : (
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
        <BaseHeader
          title={taskName}
          breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
          pageControls={
            ['running', 'waiting'].includes(task.state) && (
              <Button
                variant='secondary'
                onClick={() => this.setState({ cancelModalVisible: true })}
              >
                {t`Stop task`}
              </Button>
            )
          }
          status={
            <StatusIndicator
              className={'hub-c-task-status'}
              status={task.state}
            />
          }
        />
        <Main>
          <Flex>
            <Flex
              direction={{ default: 'column' }}
              flex={{ default: 'flex_1' }}
            >
              <FlexItem>
                <section className='body card-area'>
                  <Title headingLevel='h2' size='lg'>
                    {t`Task detail`}
                  </Title>
                  <br />
                  <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Task name`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {task.name}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    {task.name !== taskName && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t`Description`}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {taskName}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Finished at`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <DateComponent date={task.finished_at} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Created on`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <DateComponent date={task.pulp_created} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </section>
              </FlexItem>
              <FlexItem>
                <section className='body card-area'>
                  <Title headingLevel='h2' size='lg'>
                    {t`Task groups`}
                  </Title>
                  <br />
                  <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Task group`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {task.task_group ? task.task_group : t`No task group`}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Parent task`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {parentTask ? (
                          <Link
                            to={formatPath(Paths.taskDetail, {
                              task: parentTaskId,
                            })}
                          >
                            {translateTask(parentTask.name)}
                          </Link>
                        ) : (
                          t`No parent task`
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Child tasks`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {childTasks.length
                          ? childTasks.map((childTask) => {
                              const childTaskId = parsePulpIDFromURL(
                                childTask.pulp_href,
                              );
                              return (
                                <Fragment key={childTaskId}>
                                  <Link
                                    to={formatPath(Paths.taskDetail, {
                                      task: childTaskId,
                                    })}
                                  >
                                    {translateTask(childTask.name)}
                                  </Link>
                                  <br />
                                </Fragment>
                              );
                            })
                          : t`No child task`}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </section>
              </FlexItem>
              <FlexItem>
                <section className='body card-area'>
                  <Title headingLevel='h2' size='lg'>
                    {t`Reserve resources`}
                  </Title>
                  <br />
                  {resources.length ? (
                    <DescriptionList isHorizontal>
                      {resources.map((resource, index) => {
                        return (
                          <Fragment key={resource.type + index}>
                            <hr />
                            <DescriptionListGroup>
                              <DescriptionListTerm>{t`Type`}</DescriptionListTerm>
                              <DescriptionListDescription>
                                {resource.type}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            {resource.pluginName && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>{t`Plugin`}</DescriptionListTerm>
                                <DescriptionListDescription>
                                  {resource.pluginName}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                            {resource.name && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>{t`Name`}</DescriptionListTerm>
                                <DescriptionListDescription>
                                  {resource.name}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                          </Fragment>
                        );
                      })}
                    </DescriptionList>
                  ) : (
                    t`There's no resource record`
                  )}
                </section>
              </FlexItem>
            </Flex>
            <Flex
              direction={{ default: 'column' }}
              flex={{ default: 'flex_1' }}
            >
              <FlexItem>
                {!task.error && (
                  <section className='body card-area'>
                    <Title headingLevel='h2' size='lg'>
                      {t`Progress messages`}
                    </Title>
                    <br />
                    {task.progress_reports.length ? (
                      <DescriptionList isHorizontal>
                        {task.progress_reports
                          .reverse()
                          .map((report, index) => {
                            return (
                              <Fragment key={index}>
                                <hr />
                                {Object.keys(report).map((key, index) => {
                                  return (
                                    !!report[key] && (
                                      <DescriptionListGroup key={key + index}>
                                        <DescriptionListTerm>
                                          {{
                                            message: t`Message`,
                                            code: t`Code`,
                                            state: t`State`,
                                            done: t`Done`,
                                          }[key] || capitalize(key)}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                          {report[key]}
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )
                                  );
                                })}{' '}
                              </Fragment>
                            );
                          })}
                      </DescriptionList>
                    ) : (
                      <EmptyStateCustom
                        icon={CubesIcon}
                        title={t`There is no progress message.`}
                        description={t`There is no progress message.`}
                      />
                    )}
                  </section>
                )}
                {!!task.error && (
                  <section className='body card-area'>
                    <Title headingLevel='h2' size='lg'>
                      {t`Error message`}
                    </Title>
                    <br />
                    <>
                      <Title headingLevel='h3'>{t`Description`}</Title>
                      <CodeBlock>{task.error.description}</CodeBlock>
                      <Title headingLevel='h3'>{t`Traceback`}</Title>
                      <CodeBlock className={'hub-code-block'}>
                        {task.error.traceback}
                      </CodeBlock>
                    </>
                  </section>
                )}
              </FlexItem>
            </Flex>
          </Flex>
        </Main>
      </>
    );
  }

  private renderCancelModal() {
    const name = this.state.taskName;
    return (
      <ConfirmModal
        cancelAction={() => this.setState({ cancelModalVisible: false })}
        confirmAction={() => this.cancelTask()}
        title={t`Stop task`}
        confirmButtonTitle={t`Yes, stop`}
      >
        {t`${name} will stop running.`}
      </ConfirmModal>
    );
  }

  private cancelTask() {
    const { task, taskName } = this.state;
    TaskManagementAPI.patch(parsePulpIDFromURL(task.pulp_href), {
      state: 'canceled',
    })
      .then(() => {
        this.setState({
          loading: true,
          cancelModalVisible: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'success',
              title: taskName,
              description: (
                <Trans>Task &quot;{taskName}&quot; stopped successfully.</Trans>
              ),
            },
          ],
        });
        this.loadContent();
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
              title: t`Task "${taskName}" could not be stopped.`,
              description: jsxErrorMessage(status, statusText),
            },
          ],
        });
        this.loadContent();
      });
  }

  private loadContent() {
    if (!this.state.polling && !this.state.task) {
      this.setState({ polling: setInterval(() => this.loadContent(), 10000) });
    }

    const taskId = this.props.routeParams.task;
    return TaskManagementAPI.get(taskId)
      .then((result) => {
        const allRelatedTasks = [];
        let parentTask = null;
        const childTasks = [];
        const resources = [];
        if (['canceled', 'completed', 'failed'].includes(result.data.state)) {
          clearInterval(this.state.polling);
          this.setState({ polling: null });
        }
        if (result.data.parent_task) {
          const parentTaskId = parsePulpIDFromURL(result.data.parent_task);
          allRelatedTasks.push(
            TaskManagementAPI.get(parentTaskId)
              .then((result) => {
                parentTask = result.data;
              })
              .catch(() => {
                return true;
              }),
          );
        }
        if (result.data.child_tasks.length) {
          result.data.child_tasks.forEach((child) => {
            const childTaskId = parsePulpIDFromURL(child);
            allRelatedTasks.push(
              TaskManagementAPI.get(childTaskId)
                .then((result) => {
                  childTasks.push(result.data);
                })
                .catch(() => {
                  return true;
                }),
            );
          });
        }
        if (result.data.reserved_resources_record.length) {
          result.data.reserved_resources_record.forEach((resource) => {
            const url = resource.replace(PULP_API_BASE_PATH, '');
            const id = parsePulpIDFromURL(url);
            const urlParts = url.split('/');
            let resourceType = '';
            let pluginName = '';

            // pulp hrefs follow this pattern for resources added by plugins:
            // /<resource name>/<plugin name>/<resource type>/<pk>/
            // Locks can be added on the entire resource (ex /repositories/) or on a specific
            // instance of a resource (ex /repositories/ansible/ansible/123123/

            // if the url has 3 or more segements, parse out the resource, plugin name, and resource type
            if (urlParts.length >= 3) {
              resourceType = `${urlParts[0]}: ${urlParts[2]}`;
              pluginName = urlParts[1];
              // otherwise, just return the resource type
            } else {
              resource = urlParts[0];
            }

            if (id) {
              allRelatedTasks.push(
                GenericPulpAPI.get(url)
                  .then((result) => {
                    resources.push({
                      name: result.data.name,
                      type: resourceType,
                      pluginName,
                    });
                  })
                  .catch(() => {
                    return true;
                  }),
              );
            } else {
              resources.push({ type: resourceType });
            }
          });
        }
        return Promise.all(allRelatedTasks).then(() => {
          this.setState({
            task: result.data,
            childTasks,
            parentTask,
            loading: false,
            taskName: translateTask(result.data.name),
            resources,
          });
        });
      })
      .catch(() => {
        this.setState({ redirect: formatPath(Paths.notFound) });
      });
  }
}

export default withRouter(TaskDetail);
