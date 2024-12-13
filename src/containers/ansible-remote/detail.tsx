import { msg, t } from '@lingui/core/macro';
import React from 'react';
import {
  ansibleRemoteDeleteAction,
  ansibleRemoteDownloadCAAction,
  ansibleRemoteDownloadClientAction,
  ansibleRemoteDownloadRequirementsAction,
  ansibleRemoteEditAction,
} from 'src/actions';
import { AnsibleRemoteAPI, type AnsibleRemoteType } from 'src/api';
import { PageWithTabs } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canViewAnsibleRemotes } from 'src/permissions';
import { parsePulpIDFromURL } from 'src/utilities';
import { RemoteAccessTab } from './tab-access';
import { DetailsTab } from './tab-details';

const AnsibleRemoteDetail = PageWithTabs<AnsibleRemoteType>({
  breadcrumbs: ({ name, tab, params: { user, group } }) =>
    [
      { url: formatPath(Paths.ansibleRemotes), name: t`Remotes` },
      { url: formatPath(Paths.ansibleRemoteDetail, { name }), name },
      tab === 'access' && (group || user)
        ? {
            url: formatPath(Paths.ansibleRemoteDetail, { name }, { tab }),
            name: t`Access`,
          }
        : null,
      tab === 'access' && group ? { name: t`Group ${group}` } : null,
      tab === 'access' && user ? { name: t`User ${user}` } : null,
      tab === 'access' && !user && !group ? { name: t`Access` } : null,
    ].filter(Boolean),
  condition: canViewAnsibleRemotes,
  displayName: 'AnsibleRemoteDetail',
  errorTitle: msg`Remote could not be displayed.`,
  headerActions: [
    ansibleRemoteEditAction,
    ansibleRemoteDownloadRequirementsAction,
    ansibleRemoteDownloadClientAction,
    ansibleRemoteDownloadCAAction,
    ansibleRemoteDeleteAction,
  ],
  listUrl: formatPath(Paths.ansibleRemotes),
  query: ({ name }) => {
    return AnsibleRemoteAPI.list({ name })
      .then(({ data: { results } }) => results[0])
      .then((remote) => {
        // using the list api, so an empty array is really a 404
        if (!remote) {
          return Promise.reject({ response: { status: 404 } });
        }

        return AnsibleRemoteAPI.myPermissions(
          parsePulpIDFromURL(remote.pulp_href),
        )
          .then(({ data: { permissions } }) => permissions)
          .catch((e) => {
            console.error(e);
            return [];
          })
          .then((my_permissions) => ({ ...remote, my_permissions }));
      });
  },
  renderTab: (tab, item, actionContext) =>
    ({
      details: <DetailsTab item={item} actionContext={actionContext} />,
      access: <RemoteAccessTab item={item} actionContext={actionContext} />,
    })[tab],
  tabs: (tab, name) => [
    {
      active: tab === 'details',
      title: t`Details`,
      link: formatPath(Paths.ansibleRemoteDetail, { name }, { tab: 'details' }),
    },
    {
      active: tab === 'access',
      title: t`Access`,
      link: formatPath(Paths.ansibleRemoteDetail, { name }, { tab: 'access' }),
    },
  ],
});

export default AnsibleRemoteDetail;
