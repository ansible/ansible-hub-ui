import { t } from '@lingui/macro';
import { AnsibleRemoteAPI, AnsibleRemoteType } from 'src/api';
import { handleHttpError, parsePulpIDFromURL } from 'src/utilities';
import { Action } from './action';

export const ansibleRemoteDeleteAction = Action({
  title: '🚧 ' + t`Delete`,
  onClick: (
    { name, id, pulp_href }: { name: string; id?: string; pulp_href?: string },
    { addAlert },
  ) => {
    const pulpId = id || parsePulpIDFromURL(pulp_href);
    AnsibleRemoteAPI.delete(pulpId)
      .then(() => addAlert({ title: t`Removed remote ${name}` }))
      .catch(
        handleHttpError(
          t`Failed to remove remote ${name}`,
          () => null,
          addAlert,
        ),
      );
  },
  // TODO success, modal
});
