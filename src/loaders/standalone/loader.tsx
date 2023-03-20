import '../app.scss';
import '@patternfly/patternfly/patternfly.scss';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { AlertType, UIVersion } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { hasPermission } from 'src/utilities';
import { AppContext } from '../app-context';
import { StandaloneLayout } from './layout';
import { StandaloneRoutes } from './routes';

const App = (_props) => {
  const location = useLocation();

  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsType>(null);
  const [settings, setSettings] = useState<SettingsType>(null);
  const [user, setUser] = useState<UserType>(null);

  const updateInitialData = ({ alerts, featureFlags, settings, user }) => {
    setAlerts(alerts);
    setFeatureFlags(featureFlags);
    setSettings(settings);
    setUser(user);
  };

  let component = <StandaloneRoutes updateInitialData={updateInitialData} />;
  // Hide navs on login page
  if (
    location.pathname !== formatPath(Paths.login) &&
    location.pathname !== UI_EXTERNAL_LOGIN_URI
  ) {
    component = (
      <StandaloneLayout
        featureFlags={featureFlags}
        settings={settings}
        user={user}
        setUser={setUser}
      >
        {component}
      </StandaloneLayout>
    );
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
      {component}
      <UIVersion />
    </AppContext.Provider>
  );
};

export default App;
