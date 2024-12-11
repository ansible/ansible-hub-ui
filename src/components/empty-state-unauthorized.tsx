import { t } from '@lingui/core/macro';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import React from 'react';
import { EmptyStateCustom, LoginLink } from 'src/components';

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
