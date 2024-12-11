import { msg } from '@lingui/core/macro';
import { Paths, formatPath } from 'src/paths';
import { canAddAnsibleRepository } from 'src/permissions';
import { Action } from './action';

export const ansibleRepositoryCreateAction = Action({
  condition: canAddAnsibleRepository,
  title: msg`Add repository`,
  onClick: (item, { navigate }) =>
    navigate(formatPath(Paths.ansibleRepositoryEdit, { name: '_' })),
});
