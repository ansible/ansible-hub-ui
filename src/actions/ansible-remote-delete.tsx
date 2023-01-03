import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRemoteDeleteAction = Action({
  title: '🚧 ' + t`Delete`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
