import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';

class App extends Component {
    firstLoad = true;

    constructor(props) {
        super(props);

        this.state = {
            currentUser: null,
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

        insights.chrome.auth.getUser().then(user => {
            console.log(user);
            this.setState({ currentUser: user });
        });
    }

    componentWillUnmount() {
        this.appNav();
        this.buildNav();
    }

    render() {
        // Wait for the user data to load before any of the child components are
        // rendered. This will prevent API calls from happening
        // before the app can authenticate
        if (!this.state.currentUser) {
            return null;
        } else {
            return <Routes childProps={this.props} />;
        }
    }
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
