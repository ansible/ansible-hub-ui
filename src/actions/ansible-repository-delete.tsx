import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRepositoryDeleteAction = Action({
  title: '🚧 ' + t`Delete`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
