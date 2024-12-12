import '../app.scss';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useEffect, useState } from 'react';
import {
  type FeatureFlagsType,
  type SettingsType,
  type UserType,
} from 'src/api';
import { type AlertType, UIVersion } from 'src/components';
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
        updateTitle: (title) => {
          updateDocumentTitle(
            title ? `${APPLICATION_NAME} - ${title}` : APPLICATION_NAME,
          );
        },
      }}
    >
      <InsightsRoutes />
      <UIVersion />
    </AppContext.Provider>
  );
};

export default App;
