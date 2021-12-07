import { t } from '@lingui/macro';
import * as React from 'react';
import { EmptyStateCustom } from './empty-state-custom';
import { LockIcon } from '@patternfly/react-icons';
import { LoginLink } from 'src/components';

export class EmptyStateUnauthorized extends React.Component {
  render() {
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
  }
}
