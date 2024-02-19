import { msg, t } from '@lingui/macro';
import React from 'react';
import { AnsibleDistributionAPI, AnsibleRepositoryAPI } from 'src/api';
import { DeleteAnsibleRepositoryModal } from 'src/components';
import { canDeleteAnsibleRepository } from 'src/permissions';
import {
  handleHttpError,
  parsePulpIDFromURL,
  taskAlert,
  waitForTaskUrl,
} from 'src/utilities';
import { Action } from './action';

export const ansibleRepositoryDeleteAction = Action({
  condition: canDeleteAnsibleRepository,
  title: msg`Delete`,
  modal: ({ addAlert, listQuery, setState, state }) =>
    state.deleteModalOpen ? (
      <DeleteAnsibleRepositoryModal
        closeAction={() => setState({ deleteModalOpen: null })}
        deleteAction={() =>
          deleteRepository(state.deleteModalOpen, {
            addAlert,
            listQuery,
            setState,
          })
        }
        name={state.deleteModalOpen.name}
      />
    ) : null,
  onClick: (
    { name, id, pulp_href }: { name: string; id?: string; pulp_href?: string },
    { setState },
  ) =>
    setState({
      deleteModalOpen: {
        pulpId: id || parsePulpIDFromURL(pulp_href),
        name,
        pulp_href,
      },
    }),
  disabled: ({ name }) => {
    if (
      [
        'rh-certified',
        'validated',
        'community',
        'published',
        'staging',
        'rejected',
      ].includes(name)
    ) {
      return t`Protected repositories cannot be deleted.`;
    }

    return null;
  },
});

async function deleteRepository(
  { name, pulp_href, pulpId },
  { addAlert, setState, listQuery },
) {
  // TODO: handle more pages
  const distributionsToDelete = await AnsibleDistributionAPI.list({
    repository: pulp_href,
    page: 1,
    page_size: 100,
  })
    .then(({ data: { results } }) => results || [])
    .catch((e) => {
      handleHttpError(
        t`Failed to list distributions, removing only the repository.`,
        () => null,
        addAlert,
      )(e);
      return [];
    });

  const deleteRepo = AnsibleRepositoryAPI.delete(pulpId)
    .then(({ data }) => {
      addAlert(taskAlert(data.task, t`Removal started for repository ${name}`));
      return waitForTaskUrl(data.task);
    })
    .catch(
      handleHttpError(
        t`Failed to remove repository ${name}`,
        () => setState({ deleteModalOpen: null }),
        addAlert,
      ),
    );

  const deleteDistribution = ({ name, pulp_href }) => {
    const distribution_id = parsePulpIDFromURL(pulp_href);
    return AnsibleDistributionAPI.delete(distribution_id)
      .then(({ data }) => {
        addAlert(
          taskAlert(data.task, t`Removal started for distribution ${name}`),
        );
        return waitForTaskUrl(data.task);
      })
      .catch(
        handleHttpError(
          t`Failed to remove distribution ${name}`,
          () => null,
          addAlert,
        ),
      );
  };

  return Promise.all([
    deleteRepo,
    ...distributionsToDelete.map(deleteDistribution),
  ]).then(() => {
    setState({ deleteModalOpen: null });
    listQuery();
  });
}
