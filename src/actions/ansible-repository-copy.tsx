import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRepositoryCopyAction = Action({
  title: '🚧 ' + t`Copy CLI configuration`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
