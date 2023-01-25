import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleRemoteAPI, AnsibleRemoteType } from 'src/api';
import { Page } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';

const wip = '🚧 ';

export const AnsibleRemoteEdit = Page<AnsibleRemoteType>({
  breadcrumbs: ({ name }) =>
    [
      { url: formatPath(Paths.ansibleRemotes), name: t`Remotes` },
      name && { url: formatPath(Paths.ansibleRemoteDetail, { name }), name },
      name ? { name: t`Edit` } : { name: t`Add` },
    ].filter(Boolean),
  condition: isLoggedIn,
  displayName: 'AnsibleRemoteEdit',
  errorTitle: t`Remote could not be displayed.`,
  query: ({ name }) =>
    AnsibleRemoteAPI.list({ name }).then(({ data: { results } }) => results[0]),
  title: ({ name }) => wip + (name || t`Add new remote`),
  transformParams: ({ name, ...rest }) => ({
    ...rest,
    name: name !== '_' ? name : null,
  }),
  render: (item, actionContext) => <div>{JSON.stringify(item, null, 2)}</div>,
});

export default AnsibleRemoteEdit;
