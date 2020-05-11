// import PropTypes from 'prop-types';
import * as React from 'react';
import '../app.scss';
import { withRouter, Link, RouteComponentProps } from 'react-router-dom';

import '@patternfly/patternfly/patternfly.scss';
import {
  Page,
  PageHeader,
  PageSidebar,
  Nav,
  NavList,
  NavItem,
  DropdownItem,
  DropdownSeparator,
} from '@patternfly/react-core';

import { Routes } from './routes';
import Logo from '../../../static/images/galaxy_logo.svg';
import { Paths, formatPath } from '../../paths';
import { ActiveUserAPI, UserAuthType } from '../../api';
import { StatefulDropdown } from '../../components';

interface IState {
  user: UserAuthType;
}

class App extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
    };
  }

  private setUser = user => {
    this.setState({ user: user });
  };

  render() {
    const { user } = this.state;
    let dropdownItems = [];
    let userName: string;

    if (this.state.user) {
      if (user.first_name || user.last_name) {
        userName = user.first_name + ' ' + user.last_name;
      } else {
        userName = user.username;
      }

      dropdownItems = [
        <DropdownItem isDisabled key='username'>
          Username: {user.username}
        </DropdownItem>,
        <DropdownSeparator key='separator' />,

        <DropdownItem
          key='logout'
          onClick={() =>
            ActiveUserAPI.logout().then(() =>
              this.setState({ user: undefined }),
            )
          }
        >
          Logout
        </DropdownItem>,
      ];
    }

    const Header = (
      <PageHeader
        logo={
          <React.Fragment>
            <img style={{ height: '35px' }} src={Logo} alt='Galaxy Logo' />
          </React.Fragment>
        }
        toolbar={
          <div>
            {!this.state.user ? (
              <Link
                to={formatPath(
                  Paths.login,
                  {},
                  { next: this.props.location.pathname },
                )}
              >
                Login
              </Link>
            ) : (
              <StatefulDropdown
                defaultText={userName}
                toggleType='dropdown'
                items={dropdownItems}
              ></StatefulDropdown>
            )}
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

    // TODO: Provide user and setUser as part of a configuration context when
    // we have more configurations so that they can be accessd by the rest of the
    // app
    // Hide navs on login page
    if (this.props.location.pathname === Paths.login) {
      return <Routes user={this.state.user} setUser={this.setUser} />;
    }

    return (
      <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
        <Routes user={this.state.user} setUser={this.setUser} />
      </Page>
    );
  }
}

export default withRouter(App);
