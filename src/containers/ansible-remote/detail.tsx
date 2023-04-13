import { t } from '@lingui/macro';
import React from 'react';
import {
  ansibleRemoteDeleteAction,
  ansibleRemoteDownloadCAAction,
  ansibleRemoteDownloadClientAction,
  ansibleRemoteDownloadRequirementsAction,
  ansibleRemoteEditAction,
} from 'src/actions';
import { AnsibleRemoteAPI, AnsibleRemoteType } from 'src/api';
import { PageWithTabs } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canViewAnsibleRemotes } from 'src/permissions';
import { parsePulpIDFromURL } from 'src/utilities';
import { RemoteAccessTab } from './tab-access';
import { DetailsTab } from './tab-details';

const tabs = [
  { id: 'details', name: t`Details` },
  { id: 'access', name: t`Access` },
];

const AnsibleRemoteDetail = PageWithTabs<AnsibleRemoteType>({
  breadcrumbs: ({ name, tab, params: { group } }) =>
    [
      { url: formatPath(Paths.ansibleRemotes), name: t`Remotes` },
      { url: formatPath(Paths.ansibleRemoteDetail, { name }), name },
      tab.id === 'access' && group
        ? {
            url: formatPath(
              Paths.ansibleRepositoryDetail,
              { name },
              { tab: tab.id },
            ),
            name: tab.name,
          }
        : null,
      tab.id === 'access' && group
        ? { name: t`Group ${group}` }
        : { name: tab.name },
    ].filter(Boolean),
  condition: canViewAnsibleRemotes,
  displayName: 'AnsibleRemoteDetail',
  errorTitle: t`Remote could not be displayed.`,
  headerActions: [
    ansibleRemoteEditAction,
    ansibleRemoteDownloadRequirementsAction,
    ansibleRemoteDownloadClientAction,
    ansibleRemoteDownloadCAAction,
    ansibleRemoteDeleteAction,
  ],
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
    }[tab]),
  tabs,
  tabUpdateParams: (p) => {
    delete p.group;
    return p;
  },
});

export default AnsibleRemoteDetail;
