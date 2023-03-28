import '../app.scss';
import { t } from '@lingui/macro';
import { Alert } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import React, { useEffect, useState } from 'react';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { AlertType, UIVersion } from 'src/components';
import { hasPermission } from 'src/utilities';
import { AppContext } from '../app-context';
import { loadContext } from '../load-context';
import { InsightsRoutes } from './routes';

const App = (_props) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsType>(null);
  const [settings, setSettings] = useState<SettingsType>(null);
  const [user, setUser] = useState<UserType>(null);

  const { identifyApp, updateDocumentTitle } = useChrome();

  // componentDidMount
  useEffect(() => {
    identifyApp('automation-hub');
    updateDocumentTitle(APPLICATION_NAME);

    loadContext().then(({ alerts, featureFlags, settings, user }) => {
      setAlerts(alerts);
      setFeatureFlags(featureFlags);
      setSettings(settings);
      setUser(user);
    });
  }, []);

  // Wait for the user data to load before any of the child components are rendered. This will prevent API calls from happening before the app can authenticate
  if (!user) {
    return null;
  }

  const queueAlert = (alert) => setAlerts((alerts) => [...alerts, alert]);

  return (
    <AppContext.Provider
      value={{
        alerts,
        featureFlags,
        queueAlert,
        setAlerts,
        setUser,
        settings,
        user,
        hasPermission: (name) =>
          hasPermission(
            {
              user,
              settings,
              featureFlags,
            },
            name,
          ),
      }}
    >
      <Alert
        isInline
        variant='info'
        title={t`The Automation Hub sync toggle is now only supported in AAP 2.0. Previous versions of AAP will continue automatically syncing all collections.`}
      />
      <InsightsRoutes />
      <UIVersion />
    </AppContext.Provider>
  );
};

export default App;
