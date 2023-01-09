import React, { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import '../app.scss';
import '@patternfly/patternfly/patternfly.scss';
import { AppContext } from '../app-context';
import { StandaloneLayout } from './layout';
import { StandaloneRoutes } from './routes';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { AlertType, UIVersion } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { hasPermission } from 'src/utilities';

const isRepoURL = (pathname) =>
  matchPath({ path: formatPath(Paths.searchByRepo) + '*' }, pathname);

const App = (_props) => {
  const location = useLocation();
  const match = isRepoURL(location.pathname);

  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsType>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('published');
  const [settings, setSettings] = useState<SettingsType>(null);
  const [user, setUser] = useState<UserType>(null);

  useEffect(() => {
    if (match && match.params.repo !== selectedRepo) {
      setSelectedRepo(match.params.repo);
    }
  }, [location]);

  // block the page from rendering if we're on a repo route and the repo in the
  // url doesn't match the current state
  // This gives componentDidUpdate a chance to recognize that route has chnaged
  // and update the internal state to match the route before any pages can
  // redirect the URL to a 404 state.
  if (match && match.params.repo !== selectedRepo) {
    return null;
  }

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
        selectedRepo={selectedRepo}
        settings={settings}
        user={user}
        setUser={setUser}
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
        selectedRepo,
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
