import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { Action } from './action';

export const ansibleRemoteCreateAction = Action({
  title: t`Add remote`,
  onClick: (item, { navigate }) =>
    navigate(formatPath(Paths.ansibleRemoteEdit, { name: '_' })),
});
