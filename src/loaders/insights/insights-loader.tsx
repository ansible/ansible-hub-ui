import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { Alert } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import '../app.scss';
import { AppContext } from '../app-context';
import { loadContext } from '../load-context';
import { InsightsRoutes } from './routes';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { AlertType, UIVersion } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { hasPermission } from 'src/utilities';

const DEFAULT_REPO = 'published';

const isRepoURL = (pathname) =>
  matchPath({ path: formatPath(Paths.searchByRepo) + '*' }, pathname);

const App = (_props) => {
  const location = useLocation();
  const match = isRepoURL(location.pathname);

  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsType>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>(DEFAULT_REPO);
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

  // componentDidUpdate
  useEffect(() => {
    // This is sort of a dirty hack to make it so that collection details can view repositories other than "published", but all other views are locked to "published"
    // We do this because there is not currently a way to toggle repositories in automation hub on console.redhat.com, so it's important to ensure the user always lands on the published repo

    // check if the URL matches the base path for the collection detail page
    if (match) {
      // if the URL matches, allow the repo to be switched to the repo defined in the url
      if (match.params.repo !== selectedRepo) {
        setSelectedRepo(match.params.repo);
      }
    } else {
      // For all other URLs, switch the global state back to the "publised" repo if the repo is set to anything else.
      if (selectedRepo !== DEFAULT_REPO) {
        setSelectedRepo(DEFAULT_REPO);
      }
    }
  });

  // block the page from rendering if we're on a repo route and the repo in the url doesn't match the current state
  // This gives componentDidUpdate a chance to recognize that route has changed and update the internal state to match the route before any pages can redirect the URL to a 404 state.
  if (match && match.params.repo !== selectedRepo) {
    return null;
  }

  // Wait for the user data to load before any of the child components are rendered. This will prevent API calls from happening before the app can authenticate
  if (!user) {
    return null;
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
