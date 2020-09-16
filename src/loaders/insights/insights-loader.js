import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import '../app.scss';
import { AppContext } from '../app-context';
import { ActiveUserAPI } from '../../api';

class App extends Component {
  firstLoad = true;

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      activeUser: null,
      selectedRepo: 'automation-hub',
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

  render() {
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
