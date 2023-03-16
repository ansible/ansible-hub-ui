import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleRepositoryAPI } from 'src/api';
import { DeleteAnsibleRepositoryModal } from 'src/components';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositoryDeleteAction = Action({
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
      deleteModalOpen: { pulpId: id || parsePulpIDFromURL(pulp_href), name },
    }),
});

function deleteRepository({ name, pulpId }, { addAlert, setState, query }) {
  return AnsibleRepositoryAPI.delete(pulpId)
    .then(({ data }) => {
      addAlert(taskAlert(data.task, t`Removal started for repository ${name}`));

      setState({ deleteModalOpen: null });
      query();
    })
    .catch(
      handleHttpError(
        t`Failed to remove repository ${name}`,
        () => null,
        addAlert,
      ),
    );
}
