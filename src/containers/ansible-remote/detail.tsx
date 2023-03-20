import { t } from '@lingui/macro';
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from '@patternfly/react-core';
import React from 'react';
import {
  ansibleRemoteDeleteAction,
  ansibleRemoteDownloadCAAction,
  ansibleRemoteDownloadClientAction,
  ansibleRemoteDownloadRequirementsAction,
  ansibleRemoteEditAction,
} from 'src/actions';
import { AnsibleRemoteAPI, AnsibleRemoteType } from 'src/api';
import {
  CopyURL,
  Details,
  LazyRepositories,
  PageWithTabs,
} from 'src/components';
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

const PFCodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = React.useState(false);

  const clipboardCopyFunc = (event, text) => {
    navigator.clipboard.writeText(text.toString());
  };

  const onClick = (event, text) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <ClipboardCopyButton
          id='basic-copy-button'
          textId='code-content'
          aria-label='Copy to clipboard'
          onClick={(e) => onClick(e, code)}
          exitDelay={copied ? 1500 : 600}
          maxWidth='110px'
          variant='plain'
          onTooltipHidden={() => setCopied(false)}
        >
          {copied ? t`Successfully copied to clipboard` : t`Copy to clipboard`}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  );

  return (
    <CodeBlock actions={actions}>
      <CodeBlockCode id='code-content'>{code}</CodeBlockCode>
    </CodeBlock>
  );
};

const MaybeCode = ({ code }: { code: string }) =>
  code ? <PFCodeBlock code={code} /> : <>{t`None`}</>;

const DetailsTab = ({ item }: TabProps) => (
  <Details
    fields={[
      { label: t`Remote name`, value: item?.name },
      {
        label: t`URL`,
        value: <CopyURL url={item?.url} fallback />,
      },
      {
        label: t`Proxy URL`,
        value: <CopyURL url={item?.proxy_url} fallback />,
      },
      {
        label: t`TLS validation`,
        value: item?.tls_validation ? t`Enabled` : t`Disabled`,
      },
      { label: t`Client certificate`, value: item?.client_cert || t`None` },
      { label: t`CA certificate`, value: item?.ca_cert || t`None` },
      {
        label: t`Download concurrency`,
        value: item?.download_concurrency ?? t`None`,
      },
      { label: t`Rate limit`, value: item?.rate_limit ?? t`None` },
      {
        label: t`Repositories`,
        value: <LazyRepositories remoteHref={item?.pulp_href} />,
      },
      {
        label: t`YAML requirements`,
        value: <MaybeCode code={item?.requirements_file} />,
      },
    ]}
  />
);

const AccessTab = ({ item }: TabProps) => <Details item={item} />;

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
