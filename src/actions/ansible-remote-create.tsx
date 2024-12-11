import { msg } from '@lingui/core/macro';
import { Paths, formatPath } from 'src/paths';
import { canAddAnsibleRemote } from 'src/permissions';
import { Action } from './action';

export const ansibleRemoteCreateAction = Action({
  condition: canAddAnsibleRemote,
  title: msg`Add remote`,
  onClick: (item, { navigate }) =>
    navigate(formatPath(Paths.ansibleRemoteEdit, { name: '_' })),
});
