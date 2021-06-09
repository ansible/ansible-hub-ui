import * as React from 'react';
import { Main } from '../../components';

import {
  Title,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

class MaintenancePage extends React.Component {
  componentDidMount() {
    insights.chrome.init();
    insights.chrome.identifyApp('automation-hub');
  }
  render() {
    return (
      <React.Fragment>
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
              We are currently undergoing scheduled maintenance from 07:00 -
              13:00 UTC.
            </EmptyStateBody>
            <EmptyStateBody>
              We'll be back shortly, thank you for your patience.
            </EmptyStateBody>
          </EmptyState>
        </Main>
      </React.Fragment>
    );
  }
}

export default MaintenancePage;
