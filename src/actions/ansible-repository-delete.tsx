import { t } from '@lingui/macro';
import { AnsibleRepositoryAPI, AnsibleRepositoryType } from 'src/api';
import { handleHttpError, parsePulpIDFromURL } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositoryDeleteAction = Action({
  title: '🚧 ' + t`Delete`,
  onClick: (
    { name, id, pulp_href }: { name: string; id?: string; pulp_href?: string },
    { addAlert },
  ) => {
    const pulpId = id || parsePulpIDFromURL(pulp_href);
    AnsibleRepositoryAPI.delete(pulpId)
      .then(() => addAlert({ title: t`Removed repository ${name}` }))
      .catch(
        handleHttpError(
          t`Failed to remove repository ${name}`,
          () => null,
          addAlert,
        ),
      );
  },
  // TODO success, modal
});
