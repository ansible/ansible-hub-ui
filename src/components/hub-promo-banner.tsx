import { Trans } from '@lingui/react/macro';
import { Alert } from '@patternfly/react-core';
import { ExternalLink } from './external-link';

export const HubPromoBanner = () => {
  if (!IS_COMMUNITY) {
    return null;
  }

  return (
    <Alert
      isInline
      variant='info'
      title={
        <Trans>
          Looking for certified and Red Hat supported Ansible content?{' '}
          <ExternalLink href='https://console.redhat.com/ansible/automation-hub'>
            Browse Red Hat Automation Hub
          </ExternalLink>{' '}
          for enterprise-ready collections that are tested, signed, and backed
          by Red Hat.
        </Trans>
      }
      style={{ margin: '0 24px 16px 24px' }}
    />
  );
};
