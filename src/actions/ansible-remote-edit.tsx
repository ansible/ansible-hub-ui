import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRemoteEditAction = Action({
  title: '🚧 ' + t`Edit`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
