import * as React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
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
    };
  }

  componentDidMount() {
    this.loadContent();
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
    } = this.state;
    const breadcrumbs = [
      { url: Paths.taskList, name: _`Task management` },
      { name: !!task ? taskName : '' },
    ];
    let parentTaskId = null;
    if (!!parentTask) {
      parentTaskId = parsePulpIDFromURL(parentTask.pulp_href);
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
                {_`Cancel task`}
              </Button>
            )
          }
          status={
            <StatusIndicator className={'task-status'} status={task.state} />
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
                    {_`Task detail`}
                  </Title>
                  <br />
                  <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{_`Task name`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Tooltip content={task.name}>{taskName}</Tooltip>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{_`Finished at`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <DateComponent date={task.finished_at} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{_`Created on`}</DescriptionListTerm>
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
                    {_`Task groups`}
                  </Title>
                  <br />
                  <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{_`Task group`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {!!task.task_group ? task.task_group : _`No task group`}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{_`Parent task`}</DescriptionListTerm>
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
                          _`No parent task`
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{_`Child tasks`}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {!!childTasks.length
                          ? childTasks.map((childTask) => {
                              let childTaskId = parsePulpIDFromURL(
                                childTask.pulp_href,
                              );
                              return (
                                <React.Fragment>
                                  <Link
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
                          : _`No child task`}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </section>
              </FlexItem>
              <FlexItem>
                <section className='body card-area'>
                  <Title headingLevel='h2' size='lg'>
                    {_`Reserve resources`}
                  </Title>
                  <br />
                  {!!resources.length ? (
                    <DescriptionList isHorizontal>
                      {resources.map((resource) => {
                        return (
                          <React.Fragment>
                            <hr />
                            <DescriptionListGroup>
                              <DescriptionListTerm>{_`Type`}</DescriptionListTerm>
                              <DescriptionListDescription>
                                {resource.type}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>{_`Name`}</DescriptionListTerm>
                              <DescriptionListDescription>
                                {resource.name}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </React.Fragment>
                        );
                      })}
                    </DescriptionList>
                  ) : (
                    _`There's no resource record`
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
                      {_`Progress messages`}
                    </Title>
                    <br />
                    {!!task.progress_reports.length ? (
                      <DescriptionList isHorizontal>
                        {task.progress_reports.reverse().map((report) => {
                          return (
                            <React.Fragment>
                              <hr />
                              {Object.keys(report).map((key) => {
                                return (
                                  !!report[key] && (
                                    <DescriptionListGroup>
                                      <DescriptionListTerm>
                                        {capitalize(key)}
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
                        title={_`There is no progress message.`}
                        description={_`There is no progress message.`}
                      />
                    )}
                  </section>
                )}
                {!!task.error && (
                  <section className='body card-area'>
                    <Title headingLevel='h2' size='lg'>
                      {_`Error message`}
                    </Title>
                    <br />
                    <React.Fragment>
                      <Title headingLevel='h3'>{_`Description`}</Title>
                      <CodeBlock>{task.error.description}</CodeBlock>
                      <Title headingLevel='h3'>{_`Traceback`}</Title>
                      <CodeBlock>{task.error.traceback}</CodeBlock>
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
        title={_`Stop task`}
        children={_`${name} will stop running.`}
        confirmButtonTitle={_`Yes, stop`}
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
              description: _`Successfully stopped task.`,
            },
          ],
        });
        this.loadContent();
      })
      .catch(() =>
        this.setState({
          loading: true,
          cancelModalVisible: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: taskName,
              description: _`Error stopping task.`,
            },
          ],
        }),
      );
  }

  private loadContent() {
    let taskId = this.props.match.params['task'];
    return TaskManagementAPI.get(taskId).then((result) => {
      let allRelatedTasks = [];
      let parentTask = null;
      let childTasks = [];
      let resources = [];
      if (!!result.data.parent_task) {
        let parentTaskId = parsePulpIDFromURL(result.data.parent_task);
        allRelatedTasks.push(
          TaskManagementAPI.get(parentTaskId)
            .then((result) => {
              parentTask = result.data;
            })
            .catch(() => {}),
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
              .catch(() => {}),
          );
        });
      }
      if (!!result.data.reserved_resources_record.length) {
        result.data.reserved_resources_record.forEach((resource) => {
          let type = resource.split('/')[4];
          let url = resource.replace('/pulp/api/v3/', '');
          allRelatedTasks.push(
            GenericPulpAPI.get(url)
              .then((result) => {
                if (!!result.data.name) {
                  resources.push({ name: result.data.name, type });
                } else {
                  resources.push({ type });
                }
              })
              .catch(() => {}),
          );
        });
      }
      return Promise.all(allRelatedTasks).then(() => {
        this.setState({
          task: result.data,
          childTasks,
          parentTask,
          loading: false,
          taskName: Constants.TASK_NAMES[result.data.name] || result.data.name,
          resources,
        });
      });
    });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(TaskDetail);
