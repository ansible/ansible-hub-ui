import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRemoteDownloadClientAction = Action({
  title: '🚧 ' + t`Download client certificate`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
