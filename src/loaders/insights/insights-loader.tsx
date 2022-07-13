import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert } from '@patternfly/react-core';
import { Routes } from './Routes';
import '../app.scss';
import { AppContext } from '../app-context';
import {
  ActiveUserAPI,
  FeatureFlagsAPI,
  FeatureFlagsType,
  SettingsAPI,
  SettingsType,
  UserType,
} from 'src/api';
import { Paths } from 'src/paths';
import { AlertType, UIVersion } from 'src/components';

const DEFAULT_REPO = 'published';

interface IProps {
  basename: string;
  history: RouteComponentProps['history'];
  location: RouteComponentProps['location'];
  match: RouteComponentProps['match'];
}

interface IState {
  activeUser: UserType;
  alerts: AlertType[];
  featureFlags: FeatureFlagsType;
  selectedRepo: string;
  settings?: SettingsType;
}

class App extends Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      activeUser: null,
      alerts: [],
      featureFlags: null,
      selectedRepo: DEFAULT_REPO,
      settings: null,
    };
  }

  appNav: () => void;

  componentDidMount() {
    window.insights.chrome.init();
    window.insights.chrome.identifyApp('automation-hub');
    document.title = APPLICATION_NAME; // change window title from automationHub

    // This listens for insights navigation events, so this will fire
    // when items in the nav are clicked or the app is loaded for the first
    // time
    this.appNav = window.insights.chrome.on('APP_NAVIGATION', (event) => {
      // might be undefined early in the load, or may not happen at all
      if (!event?.domEvent?.href) {
        return;
      }

      // basename is either `/ansible/automation-hub` or `/beta/ansible/automation-hub`, no trailing /
      // menu events don't have the /beta, converting
      const basename = this.props.basename.replace(/^\/beta\//, '/');

      // domEvent: has the right href, always starts with /ansible/ansible-hub, no /beta prefix
      // go to the href, relative to our *actual* basename (basename has no trailing /, so a path will start with / unless empty
      const href = event.domEvent.href.replace(basename, '') || '/';

      this.props.history.push(href);
    });

    const getFeatureFlags = FeatureFlagsAPI.get().then(
      ({ data: featureFlags }) => ({
        featureFlags,
        alerts: (featureFlags?._messages || []).map((msg) => ({
          variant: 'warning',
          title: msg.split(':')[1],
        })),
      }),
    );

    Promise.all([
      ActiveUserAPI.getUser(),
      SettingsAPI.get(),
      getFeatureFlags,
    ]).then(([activeUser, { data: settings }, { alerts, featureFlags }]) =>
      this.setState({
        activeUser,
        alerts,
        featureFlags,
        settings,
      }),
    );
  }

  componentWillUnmount() {
    this.appNav();
  }

  componentDidUpdate() {
    // This is sort of a dirty hack to make it so that collection details can
    // view repositories other than "published", but all other views are locked
    // to "published"
    // We do this because there is not currently a way to toggle repositories
    // in automation hub on console.redhat.com, so it's important to ensure the user
    // always lands on the published repo

    // check if the URL matches the base path for the collection detail page
    const match = this.isRepoURL(this.props.location.pathname);

    if (match) {
      // if the URL matches, allow the repo to be switched to the repo defined in
      // the url
      if (match.params['repo'] !== this.state.selectedRepo) {
        this.setState({ selectedRepo: match.params['repo'] });
      }
    } else {
      // For all other URLs, switch the global state back to the "publised" repo
      // if the repo is set to anything else.
      if (this.state.selectedRepo !== DEFAULT_REPO) {
        this.setState({ selectedRepo: DEFAULT_REPO });
      }
    }
  }

  render() {
    // block the page from rendering if we're on a repo route and the repo in the
    // url doesn't match the current state
    // This gives componentDidUpdate a chance to recognize that route has chnaged
    // and update the internal state to match the route before any pages can
    // redirect the URL to a 404 state.
    const match = this.isRepoURL(this.props.location.pathname);
    if (match && match.params['repo'] !== this.state.selectedRepo) {
      return null;
    }

    // Wait for the user data to load before any of the child components are
    // rendered. This will prevent API calls from happening
    // before the app can authenticate
    if (!this.state.activeUser) {
      return null;
    }

    return (
      <AppContext.Provider
        value={{
          alerts: this.state.alerts,
          featureFlags: this.state.featureFlags,
          selectedRepo: this.state.selectedRepo,
          setAlerts: this.setAlerts,
          setRepo: this.setRepo,
          setUser: this.setActiveUser,
          settings: this.state.settings,
          user: this.state.activeUser,
        }}
      >
        <Alert
          isInline
          variant='info'
          title={t`The Automation Hub sync toggle is now only supported in AAP 2.0. Previous versions of AAP will continue automatically syncing all collections.`}
        />
        <Routes childProps={this.props} />
        <UIVersion />
      </AppContext.Provider>
    );
  }

  setActiveUser = (user) => {
    this.setState({ activeUser: user });
  };

  setAlerts = (alerts) => {
    this.setState({ alerts });
  };

  isRepoURL = (location) => {
    return matchPath(location, {
      path: Paths.collectionByRepo,
    });
  };

  setRepo = (_repo: string) => {
    throw new Error('RepoSelector & setRepo only available in standalone');
  };
}

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter(connect()(App));
