import '../app.scss';
import '@patternfly/patternfly/patternfly.scss';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  type FeatureFlagsType,
  type SettingsType,
  type UserType,
} from 'src/api';
import { type AlertType, UIVersion } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { hasPermission as hasPermissionUtil } from 'src/utilities';
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

  const queueAlert = (alert) => setAlerts((alerts) => [...alerts, alert]);
  const hasPermission = (name) =>
    hasPermissionUtil(
      {
        user,
        settings,
        featureFlags,
      },
      name,
    );

  const updateTitle = (title) => {
    document.title = title
      ? `${APPLICATION_NAME} - ${title}`
      : APPLICATION_NAME;
  };

  let component = <StandaloneRoutes updateInitialData={updateInitialData} />;

  // Hide navs on login page
  // FIXME: replace with "showing the login page" logic
  const showNav =
    location.pathname !== formatPath(Paths.login) &&
    (location.pathname !== UI_EXTERNAL_LOGIN_URI ||
      UI_EXTERNAL_LOGIN_URI === '/');

  if (showNav) {
    component = (
      <StandaloneLayout
        featureFlags={featureFlags}
        settings={settings}
        user={user}
        setUser={setUser}
        hasPermission={hasPermission}
      >
        {component}
      </StandaloneLayout>
    );
  }

  return (
    <AppContext.Provider
      value={{
        alerts,
        featureFlags,
        hasPermission,
        queueAlert,
        setAlerts,
        setUser,
        settings,
        updateTitle,
        user,
      }}
    >
      {component}
      <UIVersion />
    </AppContext.Provider>
  );
};

export default App;
