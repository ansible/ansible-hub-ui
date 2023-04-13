import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleDistributionAPI, AnsibleRepositoryAPI } from 'src/api';
import { DeleteAnsibleRepositoryModal } from 'src/components';
import { Constants } from 'src/constants';
import { canDeleteAnsibleRepository } from 'src/permissions';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositoryDeleteAction = Action({
  condition: canDeleteAnsibleRepository,
  title: t`Delete`,
  modal: ({ addAlert, query, setState, state }) =>
    state.deleteModalOpen ? (
      <DeleteAnsibleRepositoryModal
        closeAction={() => setState({ deleteModalOpen: null })}
        deleteAction={() =>
          deleteRepository(state.deleteModalOpen, { addAlert, setState, query })
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
    if (Constants.PROTECTED_REPOSITORIES.includes(name)) {
      return t`Protected repositories cannot be deleted.`;
    }

    return null;
  },
});

async function deleteRepository(
  { name, pulp_href, pulpId },
  { addAlert, setState, query },
) {
  const distributionsToDelete = await AnsibleDistributionAPI.list({
    repository: pulp_href,
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
      .then(({ data }) =>
        addAlert(
          taskAlert(data.task, t`Removal started for distribution ${name}`),
        ),
      )
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
    query();
  });
}
