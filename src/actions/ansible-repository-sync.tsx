import { t } from '@lingui/macro';
import { AnsibleRepositoryAPI } from 'src/api';
import { canSyncAnsibleRepository } from 'src/permissions';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositorySyncAction = Action({
  condition: canSyncAnsibleRepository,
  title: t`Sync`,
  onClick: ({ name, pulp_href }, { addAlert, query }) => {
    const pulpId = parsePulpIDFromURL(pulp_href);
    AnsibleRepositoryAPI.sync(pulpId, { mirror: true })
      .then(({ data }) => {
        addAlert(
          taskAlert(data.task, t`Sync started for repository "${name}".`),
        );

        query();
      })
      .catch(
        handleHttpError(
          t`Failed to sync repository "${name}"`,
          () => null,
          addAlert,
        ),
      );
  },
  visible: (_item, { hasPermission }) =>
    hasPermission('ansible.change_collectionremote'),
  disabled: ({ remote, last_sync_task }) => {
    if (!remote) {
      return t`There are no remotes associated with this repository.`;
    }

    if (
      last_sync_task &&
      ['running', 'waiting'].includes(last_sync_task.state)
    ) {
      return t`Sync task is already queued.`;
    }

    return null;
  },
});
