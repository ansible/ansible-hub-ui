import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRepositoryEditAction = Action({
  title: '🚧 ' + t`Edit`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
