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
  DropdownItem,
  DropdownSeparator,
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import { some } from 'lodash';

import { Routes } from './routes';
import { Paths, formatPath } from 'src/paths';
import { ActiveUserAPI, UserType, FeatureFlagsType } from 'src/api';
import { SmallLogo, StatefulDropdown } from 'src/components';
import { AboutModalWindow } from 'src/containers';
import { AppContext } from '../app-context';
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
    let docsDropdownItems = [];
    let userDropdownItems = [];
    let userName: string;

    if (user) {
      if (user.first_name || user.last_name) {
        userName = user.first_name + ' ' + user.last_name;
      } else {
        userName = user.username;
      }

      userDropdownItems = [
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

      docsDropdownItems = [
        <DropdownItem
          key='customer_support'
          href='https://access.redhat.com/support'
          target='_blank'
        >
          Customer Support <ExternalLinkAltIcon />
        </DropdownItem>,
        <DropdownItem
          key='training'
          href='https://www.ansible.com/resources/webinars-training'
          target='_blank'
        >
          Training <ExternalLinkAltIcon />
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
                  ariaLabel={'docs-dropdown'}
                  defaultText={<QuestionCircleIcon />}
                  items={docsDropdownItems}
                  toggleType='icon'
                />
                <StatefulDropdown
                  ariaLabel={'user-dropdown'}
                  defaultText={userName}
                  items={userDropdownItems}
                  toggleType='dropdown'
                />
              </div>
            )}
          </PageHeaderTools>
        }
        showNavToggle
      />
    );

    const menuItem = (name, options = {}) => ({
      ...options,
      type: 'item',
      name,
    });
    const menuSection = (name, options = {}, items = []) => ({
      ...options,
      type: 'section',
      name,
      items,
    });

    const menu =
      featureFlags && user
        ? [
            menuSection('Collections', {}, [
              menuItem('Collections', {
                url: formatPath(Paths.searchByRepo, {
                  repo: this.state.selectedRepo,
                }),
              }),
              menuItem('Namespaces', {
                url: Paths[NAMESPACE_TERM],
              }),
              menuItem('My Namespaces', {
                url: Paths.myNamespaces,
              }),
              menuItem('Repository Management', {
                url: Paths.repositories,
              }),
              menuItem('API Token', {
                url: Paths.token,
              }),
              menuItem('Approval', {
                condition: user.model_permissions.move_collection,
                url: Paths.approvalDashboard,
              }),
            ]),
            menuItem('Container Registry', {
              condition: featureFlags.execution_environments,
              url: Paths.executionEnvironments,
            }),
            menuItem('Documentation', {
              url:
                'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
              external: true,
            }),
            menuSection('User Access', {}, [
              menuItem('Users', {
                condition: user.model_permissions.view_user,
                url: Paths.userList,
              }),
              menuItem('Groups', {
                condition: user.model_permissions.view_group,
                url: Paths.groupList,
              }),
            ]),
          ]
        : [];

    const activateMenu = items => {
      items.forEach(
        item =>
          (item.active =
            item.type === 'section'
              ? activateMenu(item.items)
              : this.props.location.pathname.startsWith(item.url)),
      );
      return some(items, 'active');
    };
    activateMenu(menu);

    const ItemOrSection = ({ item }) =>
      item.type === 'section' ? (
        <MenuSection section={item} />
      ) : (
        <MenuItem item={item} />
      );
    const MenuItem = ({ item }) =>
      !('condition' in item) || !!item.condition ? (
        <NavItem
          isActive={item.active}
          onClick={() => item.onclick && item.onclick()}
        >
          {item.url && item.external ? (
            <a href={item.url} target='_blank'>
              {item.name}
              <ExternalLinkAltIcon
                style={{ position: 'absolute', right: '32px' }}
              />
            </a>
          ) : item.url ? (
            <Link to={item.url}>{item.name}</Link>
          ) : (
            item.name
          )}
        </NavItem>
      ) : null;
    const Menu = ({ items }) => (
      <>
        {items.map(item => (
          <ItemOrSection key={item.name} item={item} />
        ))}
      </>
    );
    const MenuSection = ({ section }) => (
      <NavExpandable
        title={section.name}
        isActive={section.active}
        isExpanded={section.active}
      >
        <Menu items={section.items} />
      </NavExpandable>
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

              <Menu items={menu} />
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
