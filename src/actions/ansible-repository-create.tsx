import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRepositoryCreateAction = Action({
  title: '🚧 ' + t`Add repository`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
