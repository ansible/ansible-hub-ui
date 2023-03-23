import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { Action } from './action';

export const ansibleRepositoryEditAction = Action({
  title: t`Edit`,
  onClick: ({ name }, { navigate }) =>
    navigate(formatPath(Paths.ansibleRepositoryEdit, { name })),
});
