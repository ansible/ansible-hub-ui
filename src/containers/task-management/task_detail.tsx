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

  render() {
    const { loading, task, parentTask, childTasks } = this.state;
    const breadcrumbs = [
      { url: Paths.taskList, name: _`Task management` },
      { name: !!task ? task.name : '' },
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
          title={task.name}
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          pageControls={
            <Button
              variant='secondary'
              onClick={() => console.log('CANCEL TASK')}
              disabled={true}
            >
              {_`Cancel task`}
            </Button>
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
                        {task.name}
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
                            {parentTask.name}
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
                                <Link
                                  to={formatPath(Paths.taskDetail, {
                                    task: childTaskId,
                                  })}
                                >
                                  {childTask.name}
                                </Link>
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
                        title={_`There's no progress report.`}
                        description={_`There's no progress report.`}
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
      if (!!result.data.parent_task) {
        let original = result.data;
        return TaskManagementAPI.get(taskId).then(result => {
          this.setState({
            loading: false,
            task: original,
            parentTask: result.data,
          });
        });
      } else {
        if (!!result.data.child_tasks.length) {
          console.log(result.data.child_tasks);
          this.setState({ loading: false, task: result.data });
        } else {
          this.setState({ loading: false, task: result.data });
        }
      }
    });
  }
}

export default withRouter(TaskDetail);
