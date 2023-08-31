import { t } from '@lingui/macro';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import React from 'react';
import { LoginLink } from 'src/components';
import { EmptyStateCustom } from './empty-state-custom';

export const EmptyStateUnauthorized = () => {
  return (
    <EmptyStateCustom
      icon={LockIcon}
      title={t`You do not have access to Automation Hub`}
      description={
        <>
          {t`Contact your organization administrator for more information.`}
          <br />
          <br />
          <LoginLink button />
        </>
      }
    />
  );
};
