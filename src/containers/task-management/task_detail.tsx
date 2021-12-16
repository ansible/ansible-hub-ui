import * as React from 'react';
import './task.scss';
import { t } from '@lingui/macro';
import {
  Link,
  withRouter,
  Redirect,
  RouteComponentProps,
} from 'react-router-dom';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Breadcrumbs,
  closeAlertMixin,
  ConfirmModal,
  DateComponent,
  EmptyStateCustom,
  LoadingPageSpinner,
  Main,
  StatusIndicator,
  Tooltip,
} from 'src/components';
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
import { CubesIcon } from '@patternfly/react-icons';
import { TaskType } from 'src/api/response-types/task';
import { GenericPulpAPI, TaskManagementAPI } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { Constants } from 'src/constants';
import { parsePulpIDFromURL } from 'src/utilities/parse-pulp-id';
import { capitalize } from 'lodash';

interface IState {
  loading: boolean;
  task: TaskType;
  parentTask: TaskType;
  childTasks: TaskType[];
  alerts: AlertType[];
  cancelModalVisible: boolean;
  taskName: string;
  resources: { name: string; type: string }[];
  redirect: string;
  refresh: any;
}

class TaskDetail extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      task: null,
      parentTask: null,
      childTasks: [],
      alerts: [],
      cancelModalVisible: false,
      taskName: '',
      resources: [],
      redirect: null,
      refresh: null,
    };
  }

  componentDidMount() {
    this.loadContent();
  }

  componentWillUnmount() {
    if (this.state.refresh) {
      clearInterval(this.state.refresh);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params['task'] !== this.props.match.params['task']) {
      this.setState({ loading: true });
      this.loadContent();
    }
  }

  render() {
    const {
      loading,
      task,
      parentTask,
      childTasks,
      cancelModalVisible,
      alerts,
      taskName,
      resources,
      redirect,
    } = this.state;
    const breadcrumbs = [
      { url: Paths.taskList, name: t`Task management` },
      { name: !!task ? taskName : '' },
    ];
    let parentTaskId = null;
    if (!!parentTask) {
      parentTaskId = parsePulpIDFromURL(parentTask.pulp_href);
    }
    if (!!redirect) {
      return <Redirect to={redirect}></Redirect>;
    }

    return loading ? (
      <LoadingPageSpinner />
    ) : (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {cancelModalVisible ? this.renderCancelModal() : null}
        <BaseHeader
          title={taskName}
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
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
                        <DescriptionListTerm>{t`Descriptive name`}</DescriptionListTerm>
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
                        {!!task.task_group ? task.task_group : t`No task group`}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Parent task`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {!!parentTask ? (
                          <Link
                            to={formatPath(Paths.taskDetail, {
                              task: parentTaskId,
                            })}
                          >
                            {Constants.TASK_NAMES[parentTask.name] ||
                              parentTask.name}
                          </Link>
                        ) : (
                          t`No parent task`
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t`Child tasks`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {!!childTasks.length
                          ? childTasks.map((childTask) => {
                              let childTaskId = parsePulpIDFromURL(
                                childTask.pulp_href,
                              );
                              return (
                                <React.Fragment>
                                  <Link
                                    key={childTaskId}
                                    to={formatPath(Paths.taskDetail, {
                                      task: childTaskId,
                                    })}
                                  >
                                    {Constants.TASK_NAMES[childTask.name] ||
                                      childTask.name}
                                  </Link>
                                  <br />
                                </React.Fragment>
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
                  {!!resources.length ? (
                    <DescriptionList isHorizontal>
                      {resources.map((resource, index) => {
                        return (
                          <React.Fragment key={resource.type + index}>
                            <hr />
                            <DescriptionListGroup>
                              <DescriptionListTerm>{t`Type`}</DescriptionListTerm>
                              <DescriptionListDescription>
                                {resource.type}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            {resource.name && (
                              <DescriptionListGroup>
                                <DescriptionListTerm>{t`Name`}</DescriptionListTerm>
                                <DescriptionListDescription>
                                  {resource.name}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                          </React.Fragment>
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
                    {!!task.progress_reports.length ? (
                      <DescriptionList isHorizontal>
                        {task.progress_reports
                          .reverse()
                          .map((report, index) => {
                            return (
                              <React.Fragment key={index}>
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
                              </React.Fragment>
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
                    <React.Fragment>
                      <Title headingLevel='h3'>{t`Description`}</Title>
                      <CodeBlock>{task.error.description}</CodeBlock>
                      <Title headingLevel='h3'>{t`Traceback`}</Title>
                      <CodeBlock className={'hub-code-block'}>
                        {task.error.traceback}
                      </CodeBlock>
                    </React.Fragment>
                  </section>
                )}
              </FlexItem>
            </Flex>
          </Flex>
        </Main>
      </React.Fragment>
    );
  }

  private renderCancelModal() {
    const name = this.state.taskName;
    return (
      <ConfirmModal
        cancelAction={() => this.setState({ cancelModalVisible: false })}
        confirmAction={() => this.cancelTask()}
        title={t`Stop task`}
        children={t`${name} will stop running.`}
        confirmButtonTitle={t`Yes, stop`}
      />
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
              description: t`Successfully stopped task.`,
            },
          ],
        });
        this.loadContent();
      })
      .catch(() => {
        this.setState({
          loading: true,
          cancelModalVisible: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: taskName,
              description: t`Error stopping task.`,
            },
          ],
        });
        this.loadContent();
      });
  }

  private loadContent() {
    let taskId = this.props.match.params['task'];
    if (!this.state.refresh && !this.state.task) {
      this.setState({ refresh: setInterval(() => this.loadContent(), 10000) });
    }
    return TaskManagementAPI.get(taskId)
      .then((result) => {
        let allRelatedTasks = [];
        let parentTask = null;
        let childTasks = [];
        let resources = [];
        if (['canceled', 'completed', 'failed'].includes(result.data.state)) {
          clearInterval(this.state.refresh);
          this.setState({ refresh: null });
        }
        if (!!result.data.parent_task) {
          let parentTaskId = parsePulpIDFromURL(result.data.parent_task);
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
        if (!!result.data.child_tasks.length) {
          result.data.child_tasks.forEach((child) => {
            let childTaskId = parsePulpIDFromURL(child);
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
        if (!!result.data.reserved_resources_record.length) {
          result.data.reserved_resources_record.forEach((resource) => {
            let url = resource.replace('/pulp/api/v3/', '');
            let id = parsePulpIDFromURL(url);
            let urlParts = resource.split('/');
            let type = !!id ? urlParts[4] : urlParts[urlParts.length - 2];
            if (!!id) {
              allRelatedTasks.push(
                GenericPulpAPI.get(url)
                  .then((result) => {
                    resources.push({ name: result.data.name, type });
                  })
                  .catch(() => {
                    return true;
                  }),
              );
            } else {
              resources.push({ type });
            }
          });
        }
        return Promise.all(allRelatedTasks).then(() => {
          this.setState({
            task: result.data,
            childTasks,
            parentTask,
            loading: false,
            taskName:
              Constants.TASK_NAMES[result.data.name] || result.data.name,
            resources,
          });
        });
      })
      .catch(() => {
        this.setState({ redirect: Paths.notFound });
      });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(TaskDetail);
