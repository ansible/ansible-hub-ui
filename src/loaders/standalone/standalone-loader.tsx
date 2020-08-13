// import PropTypes from 'prop-types';
import * as React from 'react';
import '../app.scss';
import { withRouter, Link, RouteComponentProps } from 'react-router-dom';

import '@patternfly/patternfly/patternfly.scss';
import {
  Page,
  PageHeader,
  PageSidebar,
  PageHeaderTools,
  Nav,
  NavList,
  NavItem,
  DropdownItem,
  DropdownSeparator,
} from '@patternfly/react-core';

import { Routes } from './routes';
import Logo from '../../../static/images/galaxy_logo.svg';
import { Paths, formatPath } from '../../paths';
import { ActiveUserAPI, MeType, UserType } from '../../api';
import { StatefulDropdown } from '../../components';
import { AppContext } from './app-context';

interface IState {
  user: MeType;
}

class App extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
    };
  }

  render() {
    const { user } = this.state;
    let dropdownItems = [];
    let userName: string;

    if (user) {
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
          key='profile'
          component={<Link to={Paths.userProfileSettings}>My profile</Link>}
        ></DropdownItem>,

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
        headerTools={
          <PageHeaderTools>
            {!user ? (
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
          </PageHeaderTools>
        }
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
              <NavItem>
                <Link to={Paths.token}>API Token</Link>
              </NavItem>
              {!!user && user.model_permissions.view_user && (
                <>
                  <NavItem>
                    <Link to={Paths.userList}>Users</Link>
                  </NavItem>
                  <NavItem>
                    <Link to={Paths.certificationDashboard}>Certification</Link>
                  </NavItem>
                </>
              )}
            </NavList>
          </Nav>
        }
      />
    );

    // Hide navs on login page
    if (this.props.location.pathname === Paths.login) {
      return this.ctx(<Routes />);
    }

    return this.ctx(
      <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
        <Routes />
      </Page>,
    );
  }

  private ctx(component) {
    return (
      <AppContext.Provider
        value={{
          user: this.state.user,
          setUser: this.setUser,
        }}
      >
        {component}
      </AppContext.Provider>
    );
  }

  private setUser = user => {
    this.setState({ user: user });
  };
}

export default withRouter(App);
