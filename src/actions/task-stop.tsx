import { i18n } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import React from 'react';
import { TaskManagementAPI } from 'src/api';
import { ConfirmModal } from 'src/components';
import { Constants } from 'src/constants';
import { errorMessage, parsePulpIDFromURL } from 'src/utilities';
import { Action } from './action';

const maybeTranslate = (name) =>
  (Constants.TASK_NAMES[name] && i18n._(Constants.TASK_NAMES[name])) || name;

const stopTask = (
  {
    addAlert,
    state: {
      selectedTask: { pulp_href },
    },
    setState,
    query,
  },
  name,
) =>
  TaskManagementAPI.patch(parsePulpIDFromURL(pulp_href), {
    state: 'canceled',
  })
    .then(() => {
      setState({
        loading: true,
        selectedTask: null,
        cancelModalVisible: false,
      });
      addAlert({
        variant: 'success',
        title: name,
        description: (
          <Trans>Task &quot;{name}&quot; stopped successfully.</Trans>
        ),
      });

      query();
    })
    .catch((e) => {
      const { status, statusText } = e.response;
      setState({
        loading: false,
        cancelModalVisible: false,
      });
      addAlert({
        variant: 'danger',
        title: t`Task "${name}" could not be stopped.`,
        description: errorMessage(status, statusText),
      });
    });

export const taskStopAction = Action({
  buttonVariant: 'secondary',
  onClick: (selectedTask, { setState }) =>
    setState({
      cancelModalVisible: true,
      selectedTask,
    }),
  title: t`Stop task`,
  visible: ({ state }) => ['running', 'waiting'].includes(state),
  modal: ({ addAlert, state, setState, query }) => {
    if (!state.cancelModalVisible) {
      return null;
    }

    const name = maybeTranslate(state.selectedTask.name);

    return (
      <ConfirmModal
        cancelAction={() => setState({ cancelModalVisible: false })}
        confirmAction={() =>
          stopTask({ addAlert, state, setState, query }, name)
        }
        confirmButtonTitle={t`Yes, stop`}
        title={t`Stop task?`}
      >
        {t`${name} will be cancelled.`}
      </ConfirmModal>
    );
  },
});
