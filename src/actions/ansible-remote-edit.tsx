import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { canEditAnsibleRemote } from 'src/permissions';
import { Action } from './action';

export const ansibleRemoteEditAction = Action({
  condition: canEditAnsibleRemote,
  title: t`Edit`,
  onClick: ({ name }, { navigate }) =>
    navigate(formatPath(Paths.ansibleRemoteEdit, { name })),
});
