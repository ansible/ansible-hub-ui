import * as React from 'react';
import { Main } from '../../components';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

class MaintenancePage extends React.Component {
  componentDidMount() {
    insights.chrome.init();
    insights.chrome.identifyApp('automation-hub');
  }

  render() {
    return (
      <Main>
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon
            icon={ExclamationTriangleIcon}
            style={{ color: 'var(--pf-global--warning-color--100)' }}
          />
          <Title headingLevel='h5' size='lg'>
            Maintenance in progress
          </Title>
          <EmptyStateBody>
            We are currently undergoing scheduled maintenance from 13:00 - 15:00
            UTC.
          </EmptyStateBody>
          <EmptyStateBody>
            We'll be back shortly, thank you for your patience.
          </EmptyStateBody>
        </EmptyState>
      </Main>
    );
  }
}

export default MaintenancePage;
