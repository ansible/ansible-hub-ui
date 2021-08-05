import * as React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {
  BaseHeader,
  Breadcrumbs,
  DateComponent,
  EmptyStateCustom,
  LoadingPageSpinner,
  Main,
  TaskStatus,
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
import { TaskManagementAPI } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { Constants } from 'src/constants';

interface IState {
  loading: boolean;
  task: TaskType;
  parentTask: TaskType;
  childTasks: TaskType[];
}

class TaskDetail extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      task: null,
      parentTask: null,
      childTasks: [],
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
    const { loading, task, parentTask, childTasks } = this.state;
    const breadcrumbs = [
      { url: Paths.taskList, name: _`Task management` },
      { name: !!task ? Constants.TASK_NAMES[task.name] || task.name : '' },
    ];
    let parentTaskId = null;
    if (!!parentTask) {
      let splitedHref = parentTask.pulp_href.split('/');
      parentTaskId = splitedHref[splitedHref.length - 2];
    }

    return loading ? (
      <LoadingPageSpinner />
    ) : (
      <React.Fragment>
        <BaseHeader
          title={Constants.TASK_NAMES[task.name] || task.name}
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          pageControls={
            ['running', 'waiting'].includes(task.state) && (
              <Button
                variant='secondary'
                onClick={() => console.log('CANCEL TASK')}
              >
                {_`Cancel task`}
              </Button>
            )
          }
          status={<TaskStatus state={task.state} />}
        ></BaseHeader>
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
                        <Tooltip content={task.name}>
                          {Constants.TASK_NAMES[task.name] || task.name}
                        </Tooltip>
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
                          ? childTasks.map(childTask => {
                              let splitedHref = childTask.pulp_href.split('/');
                              let childTaskId =
                                splitedHref[splitedHref.length - 2];
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
                  {!!task.reserved_resources_record
                    ? task.reserved_resources_record
                    : _`There's no resource record`}
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
                      {_`Progress message`}
                    </Title>
                    <br />
                    {!!task.progress_report ? (
                      task.progress_report
                    ) : (
                      <EmptyStateCustom
                        icon={CubesIcon}
                        title={_`There is no progress report.`}
                        description={_`There is no progress report.`}
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

  private loadContent() {
    let taskId = this.props.match.params['task'];
    return TaskManagementAPI.get(taskId).then(result => {
      let allRelatedTasks = [];
      let parenTask = null;
      let childTasks = [];
      if (!!result.data.parent_task) {
        let splitedHref = result.data.parent_task.split('/');
        let parentTaskId = splitedHref[splitedHref.length - 2];
        allRelatedTasks.push(
          TaskManagementAPI.get(parentTaskId).then(result => {
            parenTask = result.data;
          }),
        );
      }
      if (!!result.data.child_tasks.length) {
        result.data.child_tasks.forEach(child => {
          let splitedHref = child.split('/');
          let childTaskId = splitedHref[splitedHref.length - 2];
          allRelatedTasks.push(
            TaskManagementAPI.get(childTaskId).then(result => {
              childTasks.push(result.data);
            }),
          );
        });
      }
      return Promise.all(allRelatedTasks).then(() => {
        this.setState({
          task: result.data,
          childTasks: childTasks,
          parentTask: parenTask,
          loading: false,
        });
      });
    });
  }
}

export default withRouter(TaskDetail);
