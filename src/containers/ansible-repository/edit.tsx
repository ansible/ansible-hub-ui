import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleRepositoryAPI, AnsibleRepositoryType } from 'src/api';
import { Page } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';

const wip = '🚧 ';

export const AnsibleRepositoryEdit = Page<AnsibleRepositoryType>({
  breadcrumbs: ({ name }) =>
    [
      { url: formatPath(Paths.ansibleRepositories), name: t`Repositories` },
      name && {
        url: formatPath(Paths.ansibleRepositoryDetail, { name }),
        name,
      },
      name ? { name: t`Edit` } : { name: t`Add` },
    ].filter(Boolean),
  condition: isLoggedIn,
  displayName: 'AnsibleRepositoryEdit',
  errorTitle: t`Repository could not be displayed.`,
  query: ({ name }) =>
    AnsibleRepositoryAPI.list({ name }).then(
      ({ data: { results } }) => results[0],
    ),
  title: ({ name }) => wip + (name || t`Add new repository`),
  render: (item, actionContext) => <div>{JSON.stringify(item, null, 2)}</div>,
});

export default AnsibleRepositoryEdit;
