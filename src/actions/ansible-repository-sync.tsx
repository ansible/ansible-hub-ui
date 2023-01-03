import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRepositorySyncAction = Action({
  title: '🚧 ' + t`Sync`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
