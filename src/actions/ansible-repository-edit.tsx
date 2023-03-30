import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { canEditAnsibleRepository } from 'src/permissions';
import { Action } from './action';

export const ansibleRepositoryEditAction = Action({
  condition: canEditAnsibleRepository,
  title: t`Edit`,
  onClick: ({ name }, { navigate }) =>
    navigate(formatPath(Paths.ansibleRepositoryEdit, { name })),
});
