import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { Action } from './action';

export const ansibleRemoteEditAction = Action({
  title: t`Edit`,
  onClick: ({ name }, { navigate }) =>
    navigate(formatPath(Paths.ansibleRemoteEdit, { name })),
});
