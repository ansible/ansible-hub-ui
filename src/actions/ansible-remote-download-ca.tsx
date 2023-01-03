import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRemoteDownloadCAAction = Action({
  title: '🚧 ' + t`Download CA certificate`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
