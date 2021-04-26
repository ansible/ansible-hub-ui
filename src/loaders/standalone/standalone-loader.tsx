// import PropTypes from 'prop-types';
import * as React from 'react';
import '../app.scss';
import {
  withRouter,
  Link,
  RouteComponentProps,
  matchPath,
} from 'react-router-dom';

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
  NavGroup,
} from '@patternfly/react-core';

import { Routes } from './routes';
import { Paths, formatPath } from 'src/paths';
import { ActiveUserAPI, UserType, FeatureFlagsType } from 'src/api';
import { SmallLogo, StatefulDropdown } from 'src/components';
import { AboutModalWindow } from 'src/containers';
import { AppContext } from '../app-context';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import Logo from 'src/../static/images/logo_large.svg';

interface IState {
  user: UserType;
  selectExpanded: boolean;
  selectedRepo: string;
  aboutModalVisible: boolean;
  toggleOpen: boolean;
  featureFlags: FeatureFlagsType;
}

class App extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectExpanded: false,
      selectedRepo: 'published',
      aboutModalVisible: false,
      toggleOpen: false,
      featureFlags: null,
    };
  }

  componentDidUpdate(prevProps) {
    this.setRepoToURL();
  }

  componentDidMount() {
    this.setRepoToURL();
  }

  render() {
    const { user, selectedRepo, featureFlags } = this.state;

    // block the page from rendering if we're on a repo route and the repo in the
    // url doesn't match the current state
    // This gives componentDidUpdate a chance to recognize that route has chnaged
    // and update the internal state to match the route before any pages can
    // redirect the URL to a 404 state.
    const match = this.isRepoURL(this.props.location.pathname);
    if (match && match.params['repo'] !== selectedRepo) {
      return null;
    }

    let aboutModal = null;
    let dropdownItems,
      dropdownItemsCog = [];
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
          aria-label={'logout'}
          onClick={() =>
            ActiveUserAPI.logout().then(() => this.setState({ user: null }))
          }
        >
          Logout
        </DropdownItem>,
      ];
      dropdownItemsCog = [
        <DropdownItem
          key='customer_support'
          onClick={() =>
            window.open('https://access.redhat.com/support', '_blank')
          }
        >
          Customer Support
        </DropdownItem>,
        <DropdownItem
          key='training'
          onClick={() =>
            window.open(
              'https://www.ansible.com/resources/webinars-training',
              '_blank',
            )
          }
        >
          Training
        </DropdownItem>,
        <DropdownItem
          key='documentation'
          onClick={() =>
            window.open(
              'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
              '_blank',
            )
          }
        >
          Documentation
        </DropdownItem>,
        <DropdownItem
          key='about'
          onClick={() =>
            this.setState({ aboutModalVisible: true, toggleOpen: false })
          }
        >
          About
        </DropdownItem>,
      ];
      aboutModal = (
        <AboutModalWindow
          isOpen={this.state.aboutModalVisible}
          trademark=''
          brandImageSrc={Logo}
          onClose={() => this.setState({ aboutModalVisible: false })}
          brandImageAlt='Galaxy Logo'
          productName={APPLICATION_NAME}
          user={user}
          userName={userName}
        ></AboutModalWindow>
      );
    }

    const Header = (
      <PageHeader
        logo={<SmallLogo alt={APPLICATION_NAME}></SmallLogo>}
        logoComponent={({ children }) => (
          <Link
            to={formatPath(Paths.searchByRepo, {
              repo: this.state.selectedRepo,
            })}
          >
            {children}
          </Link>
        )}
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
              <div>
                <StatefulDropdown
                  items={dropdownItemsCog}
                  defaultText={<QuestionCircleIcon />}
                  toggleType='icon'
                  ariaLabel={'cog-dropdown'}
                />

                <StatefulDropdown
                  defaultText={userName}
                  toggleType='dropdown'
                  items={dropdownItems}
                  ariaLabel={'user-dropdown'}
                />
              </div>
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
              <NavGroup
                className={'nav-title'}
                title={APPLICATION_NAME}
              ></NavGroup>
              <NavItem>
                <Link
                  to={formatPath(Paths.searchByRepo, {
                    repo: this.state.selectedRepo,
                  })}
                >
                  Collections
                </Link>
              </NavItem>
              <NavItem>
                <Link to={Paths[NAMESPACE_TERM]}>Namespaces</Link>
              </NavItem>
              <NavItem>
                <Link to={Paths.myNamespaces}>My Namespaces</Link>
              </NavItem>
              <NavItem>
                <Link to={Paths.token}>API Token</Link>
              </NavItem>
              {!!user && user.model_permissions.view_user && (
                <NavItem>
                  <Link to={Paths.userList}>Users</Link>
                </NavItem>
              )}
              {!!user && user.model_permissions.view_group && (
                <NavItem>
                  <Link to={Paths.groupList}>Groups</Link>
                </NavItem>
              )}
              {!!user && user.model_permissions.move_collection && (
                <NavItem>
                  <Link to={Paths.approvalDashboard}>Approval</Link>
                </NavItem>
              )}
              <NavItem>
                <Link to={Paths.repositories}>Repo Management</Link>
              </NavItem>
              {featureFlags && featureFlags.execution_environments && (
                <NavItem>
                  <Link to={Paths.executionEnvironments}>
                    Container Registry
                  </Link>
                </NavItem>
              )}
            </NavList>
          </Nav>
        }
      />
    );

    // Hide navs on login page
    if (this.props.location.pathname === Paths.login) {
      return this.ctx(<Routes updateInitialData={this.updateInitialData} />);
    }

    return this.ctx(
      <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
        {this.state.aboutModalVisible && aboutModal}
        <Routes updateInitialData={this.updateInitialData} />
      </Page>,
    );
  }

  private updateInitialData = (
    user: UserType,
    flags: FeatureFlagsType,
    callback?: () => void,
  ) =>
    this.setState({ user: user, featureFlags: flags }, () => {
      if (callback) {
        callback();
      }
    });

  private setRepoToURL() {
    const match = this.isRepoURL(this.props.location.pathname);
    if (match) {
      if (match.params['repo'] !== this.state.selectedRepo) {
        this.setState({ selectedRepo: match.params['repo'] });
      }
    }
  }

  private isRepoURL(location) {
    return matchPath(location, {
      path: Paths.searchByRepo,
    });
  }

  private ctx(component) {
    return (
      <AppContext.Provider
        value={{
          user: this.state.user,
          setUser: this.setUser,
          selectedRepo: this.state.selectedRepo,
          setRepo: this.setRepo,
          featureFlags: this.state.featureFlags,
        }}
      >
        {component}
      </AppContext.Provider>
    );
  }

  private setUser = (user: UserType, callback?: () => void) => {
    this.setState({ user: user }, () => {
      if (callback) {
        callback();
      }
    });
  };

  private setRepo = (path: string, callback?: () => void) => {
    // this.setState({ selectedRepo: repo }, () => {
    if (callback) {
      this.props.history.push(path);
      callback();
    }
    // });
  };
}

export default withRouter(App);
