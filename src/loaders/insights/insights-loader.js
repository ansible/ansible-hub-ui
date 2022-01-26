import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import '../app.scss';
import { AppContext } from '../app-context';
import { ActiveUserAPI, SettingsAPI } from 'src/api';
import { Paths } from 'src/paths';

const DEFAULT_REPO = 'published';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      activeUser: null,
      selectedRepo: DEFAULT_REPO,
      alerts: [],
      settings: {},
    };
  }

  componentDidMount() {
    window.insights.chrome.init();
    window.insights.chrome.identifyApp('automation-hub');

    // This listens for insights navigation events, so this will fire
    // when items in the nav are clicked or the app is loaded for the first
    // time
    this.appNav = window.insights.chrome.on('APP_NAVIGATION', (event) => {
      // might be undefined early in the load, or may not happen at all
      if (!event?.domEvent) {
        return;
      }

      // basename is either `/ansible/automation-hub` or `/beta/ansible/automation-hub`, no trailing /
      // menu events don't have the /beta, converting
      const basename = this.props.basename.replace(/^\/beta\//, '/');

      if (event.domEvent.href) {
        // prod-beta
        // domEvent: has the right href, always starts with /ansible/ansible-hub, no /beta prefix
        // (navId: corresponds to the last url component, but not the same one, ansible-hub means /ansible/ansible-hub, partners means /ansible/ansible-hub/partners)

        // go to the href, relative to our *actual* basename (basename has no trailing /, so a path will start with / unless empty
        this.props.history.push(
          event.domEvent.href.replace(basename, '') || '/',
        );
      } else {
        // FIXME: may no longer be needed by the time this gets to prod-stable
        // prod-stable
        // (domEvent is a react event, no href (there is an absolute url in domEvent.target.href))
        // navId: corresponds to the first url component after prefix, "" means /ansible/ansible-hub, partners means /ansible/ansible-hub/partners
        this.props.history.push(`/${event.navId}`);
      }
    });

    window.insights.chrome.auth
      .getUser()
      .then((user) => this.setState({ user: user }));
    let promises = [];
    promises.push(ActiveUserAPI.getActiveUser());
    promises.push(SettingsAPI.get());
    Promise.all(promises).then((results) => {
      this.setState({
        activeUser: results[0].data,
        settings: results[1].data,
      });
    });
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
    if (!this.state.user || !this.state.activeUser) {
      return null;
    }

    const HTMLComment = ({ text }) => (
      <div dangerouslySetInnerHTML={{ __html: `<!-- ${text} -->` }} />
    );

    return (
      <AppContext.Provider
        value={{
          user: this.state.activeUser,
          setUser: this.setActiveUser,
          selectedRepo: this.state.selectedRepo,
          alerts: this.state.alerts,
          setAlerts: this.setAlerts,
          settings: this.state.settings,
        }}
      >
        <Routes childProps={this.props} />
        <HTMLComment text={`ansible-hub-ui ${UI_COMMIT_HASH}`} />
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
}

App.propTypes = {
  history: PropTypes.object,
  basename: PropTypes.string.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter(connect()(App));
