import { Trans, t } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import { AnsibleRepositoryAPI } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { handleHttpError, parsePulpIDFromURL } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositorySyncAction = Action({
  title: t`Sync`,
  onClick: ({ name, pulp_href }, { addAlert, query }) => {
    const pulpId = parsePulpIDFromURL(pulp_href);
    AnsibleRepositoryAPI.sync(pulpId)
      .then(({ data }) => {
        const task = parsePulpIDFromURL(data.task);
        addAlert({
          title: t`Sync started for repository "${name}".`,
          variant: 'info',
          description: (
            <span>
              <Trans>
                See the task management{' '}
                <Link to={formatPath(Paths.taskDetail, { task })}>
                  detail page{' '}
                </Link>
                for the status of this task.
              </Trans>
            </span>
          ),
        });

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
