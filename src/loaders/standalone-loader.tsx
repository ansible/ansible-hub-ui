// import PropTypes from 'prop-types';
import * as React from 'react';
import './app.scss';
import {
  withRouter,
  Link,
  RouteComponentProps,
  Redirect,
} from 'react-router-dom';

import '@patternfly/patternfly/patternfly.scss';
import {
  Page,
  PageHeader,
  PageSidebar,
  Nav,
  NavList,
  NavItem,
} from '@patternfly/react-core';

import { Routes } from '../Routes';
import Logo from '../../static/images/galaxy_logo.svg';
import { Paths } from '../paths';
import { ActiveUserAPI } from '../api';

interface IState {
  currentUser: any;
}

class App extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = { currentUser: undefined };
  }

  componentDidMount() {
    ActiveUserAPI.getUser()
      .then(user => console.log(user))
      .catch(err => this.props.history.push(Paths.login));
  }

  render() {
    const Header = (
      <PageHeader
        logo={
          <React.Fragment>
            <img style={{ height: '35px' }} src={Logo} alt='Galaxy Logo' />
          </React.Fragment>
        }
        toolbar={
          <div>
            <a href='/auth/login/?next=/'>Login</a> |{' '}
            <a href='/auth/logout/?next=/'>Logout</a>
          </div>
        }
        avatar=''
        showNavToggle
      />
    );
    const Sidebar = (
      <PageSidebar
        theme='dark'
        nav={
          <Nav theme='dark'>
            <NavList>
              <NavItem>
                <Link to={Paths.search}>Collections</Link>
              </NavItem>
              <NavItem>
                <Link to={Paths.partners}>Namespaces</Link>
              </NavItem>
              <NavItem>
                <Link to={Paths.myNamespaces}>My Namespaces</Link>
              </NavItem>
            </NavList>
          </Nav>
        }
      />
    );

    if (this.props.location.pathname === Paths.login) {
      return <Routes childProps={this.props} />;
    }

    if (this.state.redirect) {
      return <Redirect to={Paths.login}></Redirect>;
    }

    return (
      <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
        <Routes childProps={this.props} />
      </Page>
    );
  }
}

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 */
export default withRouter(App);
