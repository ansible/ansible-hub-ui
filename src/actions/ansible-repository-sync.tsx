import { Trans, msg, t } from '@lingui/macro';
import {
  Button,
  FormGroup,
  Modal,
  Spinner,
  Switch,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnsibleRepositoryAPI } from 'src/api';
import { HelperText } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canSyncAnsibleRepository } from 'src/permissions';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

const SyncModal = ({
  closeAction,
  syncAction,
  name,
}: {
  closeAction: () => null;
  syncAction: (syncParams) => Promise<void>;
  name: string;
}) => {
  const [pending, setPending] = useState(false);
  const [syncParams, setSyncParams] = useState({
    mirror: true,
    optimize: true,
  });

  useEffect(() => {
    setPending(false);
    setSyncParams({ mirror: true, optimize: true });
  }, [name]);

  if (!name) {
    return null;
  }

  return (
    <Modal
      actions={[
        <div data-cy='sync-button' key='sync'>
          <Button
            key='sync'
            onClick={() => {
              setPending(true);
              syncAction(syncParams)
                .then(closeAction)
                .finally(() => setPending(false));
            }}
            variant='primary'
            isDisabled={pending}
          >
            {t`Sync`}
            {pending && <Spinner size='sm' />}
          </Button>
        </div>,
        <Button key='close' onClick={closeAction} variant='link'>
          {t`Close`}
        </Button>,
      ]}
      isOpen
      onClose={closeAction}
      title={t`Sync repository "${name}"`}
      variant='medium'
    >
      <FormGroup
        label={t`Mirror`}
        labelIcon={
          <HelperText
            content={t`If selected, all content that is not present in the remote repository will be removed from the local repository; otherwise, sync will add missing content.`}
          />
        }
      >
        <Switch
          isChecked={syncParams.mirror}
          onChange={(_event, mirror) =>
            setSyncParams({ ...syncParams, mirror })
          }
          label={t`Content not present in remote repository will be removed from the local repository`}
          labelOff={t`Sync will only add missing content`}
        />
      </FormGroup>
      <br />
      <FormGroup
        label={t`Optimize`}
        labelIcon={
          <HelperText
            content={t`Only perform the sync if changes are reported by the remote server. To force a sync to happen, deselect this option.`}
          />
        }
      >
        <Switch
          isChecked={syncParams.optimize}
          onChange={(_event, optimize) =>
            setSyncParams({ ...syncParams, optimize })
          }
          label={t`Only perform the sync if changes are reported by the remote server.`}
          labelOff={t`Force a sync to happen.`}
        />
      </FormGroup>
      <br />
    </Modal>
  );
};

export const ansibleRepositorySyncAction = Action({
  condition: canSyncAnsibleRepository,
  title: msg`Sync`,
  modal: ({ addAlert, query, setState, state }) =>
    state.syncModalOpen ? (
      <SyncModal
        closeAction={() => setState({ syncModalOpen: null })}
        syncAction={(syncParams) =>
          syncRepository(state.syncModalOpen, { addAlert, query }, syncParams)
        }
        name={state.syncModalOpen.name}
      />
    ) : null,
  onClick: ({ name, pulp_href }, { setState }) =>
    setState({
      syncModalOpen: { name, pulp_href },
    }),
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

    // Remote checks only available on detail screen; list will have remote: string, so no .url
    if (remote && remote.url === 'https://galaxy.ansible.com/api/') {
      const name = remote.name;
      const url = formatPath(Paths.ansibleRemoteEdit, { name });

      if (!remote.requirements_file) {
        return (
          <Trans>
            YAML requirements are required to sync from Galaxy. You can{' '}
            <Link to={url}>edit the {name} remote</Link> to add requirements.
          </Trans>
        );
      }

      if (remote.signed_only) {
        return (
          <Trans>
            Community content will never be synced if the remote is set to only
            sync signed content. You can{' '}
            <Link to={url}>edit the {name} remote</Link> to change it.
          </Trans>
        );
      }
    }

    return null;
  },
});

function syncRepository({ name, pulp_href }, { addAlert, query }, syncParams) {
  const pulpId = parsePulpIDFromURL(pulp_href);
  return AnsibleRepositoryAPI.sync(pulpId, syncParams || { mirror: true })
    .then(({ data }) => {
      addAlert(taskAlert(data.task, t`Sync started for repository "${name}".`));

      query();
    })
    .catch(
      handleHttpError(
        t`Failed to sync repository "${name}"`,
        () => null,
        addAlert,
      ),
    );
}
