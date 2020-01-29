import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Routes } from '../Routes';
import './app.scss';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: null,
        };
    }

    componentDidMount() {
        console.log('app loaded')
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
export default withRouter(App);
