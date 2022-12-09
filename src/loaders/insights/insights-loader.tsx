import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { Routes } from './Routes';
import '../app.scss';
import { AppContext } from '../app-context';
import { loadContext } from '../load-context';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { Paths } from 'src/paths';
import { AlertType, UIVersion } from 'src/components';
import { hasPermission } from 'src/utilities';

const DEFAULT_REPO = 'published';

interface IProps {
  basename: string;
  history: RouteComponentProps['history'];
  location: RouteComponentProps['location'];
  match: RouteComponentProps['match'];
}

const isRepoURL = (location) =>
  matchPath(location, { path: Paths.collectionByRepo });

const App = (props: IProps) => {
  const match = isRepoURL(props.location.pathname);

  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsType>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>(DEFAULT_REPO);
  const [settings, setSettings] = useState<SettingsType>(null);
  const [user, setUser] = useState<UserType>(null);
  const setRepo = (_repo: string) => {
    throw new Error('RepoSelector & setRepo only available in standalone');
  };

  const { identifyApp, on, updateDocumentTitle } = useChrome();

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

    // This listens for insights navigation events, so this will fire when items in the nav are clicked or the app is loaded for the first time
    const unregister = on('APP_NAVIGATION', (event) => {
      // might be undefined early in the load, or may not happen at all
      if (!event?.domEvent?.href) {
        return;
      }

      // basename is either `/ansible/automation-hub` or `/beta/ansible/automation-hub`, remove trailing /
      // menu events don't have the /beta, converting
      const basename = props.basename
        .replace(/^\/beta\//, '/')
        .replace(/\/$/, '');

      // domEvent: has the right href, always starts with /ansible/ansible-hub, no /beta prefix
      // go to the href, relative to our *actual* basename (basename has no trailing /, so a path will start with / unless empty
      const href = event.domEvent.href.replace(basename, '') || '/';

      props.history.push(href);
    });

    return () => {
      unregister?.();
    };
  }, []);

  // componentDidUpdate
  useEffect(() => {
    // This is sort of a dirty hack to make it so that collection details can view repositories other than "published", but all other views are locked to "published"
    // We do this because there is not currently a way to toggle repositories in automation hub on console.redhat.com, so it's important to ensure the user always lands on the published repo

    // check if the URL matches the base path for the collection detail page
    if (match) {
      // if the URL matches, allow the repo to be switched to the repo defined in the url
      if (match.params['repo'] !== selectedRepo) {
        setSelectedRepo(match.params['repo']);
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
  if (match && match.params['repo'] !== selectedRepo) {
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
        setRepo,
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
      <Routes childProps={props} />
      <UIVersion />
    </AppContext.Provider>
  );
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter(connect()(App));
