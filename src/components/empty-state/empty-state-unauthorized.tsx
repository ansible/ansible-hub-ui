import * as React from 'react';
import { EmptyStateCustom } from './empty-state-custom';
import { LockIcon } from '@patternfly/react-icons';

interface IProps {}

export class EmptyStateUnauthorized extends React.Component<IProps> {
  render() {
    return (
      <EmptyStateCustom
        icon={LockIcon}
        title={t`You do not have access to Automation Hub`}
        description={t`Contact you organization administrator for more information.`}
      />
    );
  }
}
