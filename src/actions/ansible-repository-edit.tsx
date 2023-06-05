import { msg } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { canEditAnsibleRepository } from 'src/permissions';
import { Action } from './action';

export const ansibleRepositoryEditAction = Action({
  condition: canEditAnsibleRepository,
  title: msg`Edit`,
  onClick: ({ name }, { navigate }) =>
    navigate(formatPath(Paths.ansibleRepositoryEdit, { name })),
});
