import { t } from '@lingui/macro';
import { Action } from './action';

export const ansibleRemoteCreateAction = Action({
  title: '🚧 ' + t`Add remote`,
  onClick: (item, { addAlert }) => addAlert({ title: 'TODO' }),
});
