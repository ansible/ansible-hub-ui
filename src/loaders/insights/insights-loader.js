import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import '../app.scss';
import { AppContext } from '../app-context';
import { ActiveUserAPI } from '../../api';
import { Paths } from '../../paths';

const DEFAULT_REPO = 'published';

class App extends Component {
  firstLoad = true;

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      activeUser: null,
      selectedRepo: DEFAULT_REPO,
    };
  }

  componentDidMount() {
    insights.chrome.init();
    insights.chrome.identifyApp('automation-hub');
    insights.chrome.navigation(buildNavigation());

    // This listens for insights navigation events, so this will fire
    // when items in the nav are clicked or the app is loaded for the first
    // time
    this.appNav = insights.chrome.on('APP_NAVIGATION', event => {
      // We want to be able to navigate between routes when users click
      // on the nav, so rewriting the entire route is acceptable, however,
      // we also need to avoid rewriting the route when the page is
      // loaded for the first time, so ignore this the first time it's
      // called.
      if (!this.firstLoad) {
        this.props.history.push(`/${event.navId}`);
      } else {
        this.firstLoad = false;
      }
    });
    this.buildNav = this.props.history.listen(() =>
      insights.chrome.navigation(buildNavigation()),
    );

    insights.chrome.auth.getUser().then(user => this.setState({ user: user }));
    ActiveUserAPI.getActiveUser().then(result =>
      this.setState({ activeUser: result.data }),
    );
  }

  componentWillUnmount() {
    this.appNav();
    this.buildNav();
  }

  componentDidUpdate(prevProps) {
    // This is sort of a dirty hack to make it so that collection details can
    // view repositories other than "published", but all other views are locked
    // to "published"
    // We do this because there is not currently a way to toggle repositories
    // in automation hub on cloud.redhat.com, so it's important to ensure the user
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
    } else {
      return (
        <AppContext.Provider
          value={{
            user: this.state.activeUser,
            setUser: this.setActiveUser,
            selectedRepo: this.state.selectedRepo,
          }}
        >
          <Routes childProps={this.props} />
        </AppContext.Provider>
      );
    }
  }
  setActiveUser = user => {
    this.setState({ activeUser: user });
  };

  isRepoURL = location => {
    return matchPath(location, {
      path: Paths.collectionByRepo,
    });
  };
}

App.propTypes = {
  history: PropTypes.object,
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter(connect()(App));

function buildNavigation() {
  const currentPath = window.location.pathname.split('/').slice(-1)[0];
  return [
    {
      title: 'Actions',
      id: 'actions',
    },
    {
      title: 'Rules',
      id: 'rules',
    },
  ].map(item => ({
    ...item,
    active: item.id === currentPath,
  }));
}
