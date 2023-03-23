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
import { AccessTab } from './tab-access';
import { DetailsTab } from './tab-details';

const wip = '🚧 ';

const tabs = [
  { id: 'details', name: t`Details` },
  { id: 'access', name: wip + t`Access` },
];

export const AnsibleRemoteDetail = PageWithTabs<AnsibleRemoteType>({
  breadcrumbs: ({ name, tab }) => [
    { url: formatPath(Paths.ansibleRemotes), name: t`Remotes` },
    { url: formatPath(Paths.ansibleRemoteDetail, { name }), name },
    { name: tab.name },
  ],
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
      access: <AccessTab item={item} actionContext={actionContext} />,
    }[tab]),
  tabs,
});

export default AnsibleRemoteDetail;
