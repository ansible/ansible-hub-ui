import * as React from 'react';
import { EmptyStateCustom } from './empty-state-custom';
import { LockIcon } from '@patternfly/react-icons';

interface IProps {}

export class EmptyStateUnauthorized extends React.Component<IProps> {
  render() {
    return (
      <EmptyStateCustom
        icon={LockIcon}
        title={_`You do not have have access to Automation Hub`}
        description={_`Contact you organization administrator for more information.`}
      />
    );
  }
}
