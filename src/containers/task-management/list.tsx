import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import { taskStopAction } from 'src/actions';
import { TaskManagementAPI } from 'src/api';
import { TaskType } from 'src/api/response-types/task';
import {
  DateComponent,
  ListItemActions,
  ListPage,
  StatusIndicator,
  Tooltip,
} from 'src/components';
import { Constants } from 'src/constants';
import { Paths, formatPath } from 'src/paths';
import { canViewAllTasks, isLoggedIn } from 'src/permissions';
import { parsePulpIDFromURL } from 'src/utilities';
import './task.scss';

interface IState {
  cancelModalVisible: boolean;
  selectedTask: TaskType;
}

const maybeTranslate = (name) =>
  (Constants.TASK_NAMES[name] && i18n._(Constants.TASK_NAMES[name])) || name;

export const TaskList = ListPage<TaskType, IState>({
  condition: isLoggedIn,
  defaultPageSize: 10,
  defaultSort: '-pulp_created',
  displayName: 'TaskList',
  didMount: ({ context, addAlert }) => {
    if (!canViewAllTasks(context)) {
      addAlert({
        title: t`You do not have permission to view all tasks. Only tasks created by you are visible.`,
        variant: 'info',
      });
    }
  },
  errorTitle: t`Tasks list could not be displayed.`,
  extraState: {
    cancelModalVisible: false,
    selectedTask: null,
  },
  filterConfig: [
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
  ],
  noDataDescription: t`Tasks will appear once created.`,
  noDataTitle: t`No tasks yet`,
  query: ({ params }) => TaskManagementAPI.list(params),
  renderModals: ({ addAlert, setState, state, query }) =>
    taskStopAction.modal({ addAlert, setState, state, query }),
  renderTableRow(item: TaskType, index: number, actionContext) {
    const { name, state, pulp_created, started_at, finished_at, pulp_href } =
      item;
    const taskId = parsePulpIDFromURL(pulp_href);

    const buttons = [taskStopAction.button(item, actionContext)];

    return (
      <tr key={index}>
        <td>
          <Link to={formatPath(Paths.taskDetail, { task: taskId })}>
            <Tooltip content={maybeTranslate(name)}>{name}</Tooltip>
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
        <ListItemActions buttons={buttons} />
      </tr>
    );
  },
  sortHeaders: [
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
  title: t`Task Management`,
});

export default TaskList;
