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
import { Details, PageWithTabs } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';

const wip = '🚧 ';

const tabs = [
  { id: 'details', name: t`Details` },
  { id: 'access', name: wip + t`Access` },
];

interface TabProps {
  item: AnsibleRemoteType;
  actionContext: object;
}

const DetailsTab = ({ item, actionContext }: TabProps) => (
  <Details
    item={item}
    fields={[
      { label: t`Remote name`, value: item?.name },
      { label: t`Description`, value: 'TODO' },
      { label: t`URL`, value: item?.url },
      { label: wip + t`Username`, value: 'TODO' },
      { label: t`Proxy URL`, value: item?.proxy_url },
      { label: wip + t`Proxy username`, value: 'TODO' },
      {
        label: t`TLS validation`,
        value: item?.tls_validation ? t`true` : t`false`,
      },
      { label: wip + t`Client key`, value: 'TODO' },
      { label: t`Client certificate`, value: item?.client_cert },
      { label: t`CA certificate`, value: item?.ca_cert },
      {
        label: t`Download concurrency`,
        value: item?.download_concurrency,
      },
      { label: t`Rate limit`, value: item?.rate_limit },
      { label: wip + t`YAML requirements`, value: item?.requirements_file },
    ]}
  />
);

const AccessTab = ({ item, actionContext }: TabProps) => (
  <Details item={item} />
);

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
