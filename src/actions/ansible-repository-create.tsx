import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { Action } from './action';

export const ansibleRepositoryCreateAction = Action({
  title: t`Add repository`,
  onClick: (item, { navigate }) =>
    navigate(formatPath(Paths.ansibleRepositoryEdit, { name: '_' })),
});
