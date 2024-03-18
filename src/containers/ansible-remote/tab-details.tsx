import { t } from '@lingui/macro';
import {
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from '@patternfly/react-core';
import React from 'react';
import { AnsibleRemoteType } from 'src/api';
import {
  CopyURL,
  Details,
  HubCopyButton,
  LazyRepositories,
} from 'src/components';

interface TabProps {
  item: AnsibleRemoteType;
  actionContext: object;
}

const PFCodeBlock = ({ code }: { code: string }) => {
  const actions = (
    <CodeBlockAction>
      <HubCopyButton text={code} textId='code-content' />
    </CodeBlockAction>
  );

  return (
    <CodeBlock actions={actions}>
      <CodeBlockCode id='code-content'>{code}</CodeBlockCode>
    </CodeBlock>
  );
};

const MaybeCode = ({ code }: { code: string }) =>
  code ? <PFCodeBlock code={code} /> : <>{t`None`}</>;

export const DetailsTab = ({ item }: TabProps) => (
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
