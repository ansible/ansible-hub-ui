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
import { isLoggedIn } from 'src/permissions';
import { RemoteAccessTab } from './tab-access';
import { DetailsTab } from './tab-details';

const tabs = [
  { id: 'details', name: t`Details` },
  { id: 'access', name: t`Access` },
];

export const AnsibleRemoteDetail = PageWithTabs<AnsibleRemoteType>({
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
  condition: isLoggedIn,
  displayName: 'AnsibleRemoteDetail',
  errorTitle: t`Remote could not be displayed.`,
  headerActions: [
    ansibleRemoteEditAction,
    ansibleRemoteDownloadRequirementsAction,
    ansibleRemoteDownloadClientAction,
    ansibleRemoteDownloadCAAction,
    ansibleRemoteDeleteAction,
  ],
  query: ({ name }) =>
    AnsibleRemoteAPI.list({ name }).then(({ data: { results } }) => results[0]),
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
