import { msg, t } from '@lingui/core/macro';
import { AnsibleRemoteAPI } from 'src/api';
import { DeleteAnsibleRemoteModal } from 'src/components';
import { canDeleteAnsibleRemote } from 'src/permissions';
import {
  handleHttpError,
  parsePulpIDFromURL,
  taskAlert,
  waitForTaskUrl,
} from 'src/utilities';
import { Action } from './action';

export const ansibleRemoteDeleteAction = Action({
  condition: canDeleteAnsibleRemote,
  title: msg`Delete`,
  modal: ({ addAlert, listQuery, setState, state }) =>
    state.deleteModalOpen ? (
      <DeleteAnsibleRemoteModal
        closeAction={() => setState({ deleteModalOpen: null })}
        deleteAction={() =>
          deleteRemote(state.deleteModalOpen, { addAlert, setState, listQuery })
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

function deleteRemote({ name, pulpId }, { addAlert, setState, listQuery }) {
  return AnsibleRemoteAPI.delete(pulpId)
    .then(({ data }) => {
      addAlert(taskAlert(data.task, t`Removal started for remote ${name}`));
      setState({ deleteModalOpen: null });
      return waitForTaskUrl(data.task);
    })
    .then(() => listQuery())
    .catch(
      handleHttpError(t`Failed to remove remote ${name}`, () => null, addAlert),
    );
}
