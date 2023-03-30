import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { canAddAnsibleRepository } from 'src/permissions';
import { Action } from './action';

export const ansibleRepositoryCreateAction = Action({
  condition: canAddAnsibleRepository,
  title: t`Add repository`,
  onClick: (item, { navigate }) =>
    navigate(formatPath(Paths.ansibleRepositoryEdit, { name: '_' })),
});
