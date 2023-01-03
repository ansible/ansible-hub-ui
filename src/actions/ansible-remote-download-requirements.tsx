import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRemoteDownloadRequirementsAction = Action({
  title: '🚧 ' + t`Download requirements YAML`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
