import { t, Trans } from '@lingui/macro';
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
import { reject, some } from 'lodash';

import { Routes } from './routes';
import { Paths, formatPath } from 'src/paths';
import { ActiveUserAPI, UserType, FeatureFlagsType } from 'src/api';
import { SmallLogo, StatefulDropdown } from 'src/components';
import { AboutModalWindow } from 'src/containers';
import { AppContext } from '../app-context';
import Logo from 'src/../static/images/logo_large.svg';

interface IState {
  user: UserType;
  selectedRepo: string;
  aboutModalVisible: boolean;
  toggleOpen: boolean;
  featureFlags: FeatureFlagsType;
  menuExpandedSections: string[];
}

class App extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectedRepo: 'published',
      aboutModalVisible: false,
      toggleOpen: false,
      featureFlags: null,
      menuExpandedSections: [],
    };
  }

  componentDidUpdate(prevProps) {
    this.setRepoToURL();
  }

  componentDidMount() {
    this.setRepoToURL();

    const menu = this.menu();
    this.activateMenu(menu);
    this.setState({
      menuExpandedSections: menu
        .filter((i) => i.type === 'section' && i.active)
        .map((i) => i.name),
    });
  }

  render() {
    const { featureFlags, menuExpandedSections, selectedRepo, user } =
      this.state;

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
          <Trans>Username: {user.username}</Trans>
        </DropdownItem>,
        <DropdownSeparator key='separator' />,
        <DropdownItem
          key='profile'
          component={
            <Link to={Paths.userProfileSettings}>{t`My profile`}</Link>
          }
        ></DropdownItem>,

        <DropdownItem
          key='logout'
          aria-label={'logout'}
          onClick={() =>
            ActiveUserAPI.logout().then(() => this.setState({ user: null }))
          }
        >
          {t`Logout`}
        </DropdownItem>,
      ];

      docsDropdownItems = [
        <DropdownItem
          key='customer_support'
          href='https://access.redhat.com/support'
          target='_blank'
        >
          <Trans>
            Customer Support <ExternalLinkAltIcon />
          </Trans>
        </DropdownItem>,
        <DropdownItem
          key='training'
          href='https://www.ansible.com/resources/webinars-training'
          target='_blank'
        >
          <Trans>
            Training <ExternalLinkAltIcon />
          </Trans>
        </DropdownItem>,
        <DropdownItem
          key='about'
          onClick={() =>
            this.setState({ aboutModalVisible: true, toggleOpen: false })
          }
        >
          {t`About`}
        </DropdownItem>,
      ];

      aboutModal = (
        <AboutModalWindow
          isOpen={this.state.aboutModalVisible}
          trademark=''
          brandImageSrc={Logo}
          onClose={() => this.setState({ aboutModalVisible: false })}
          brandImageAlt={t`Galaxy Logo`}
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
                {t`Login`}
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

    const menu = this.menu();
    this.activateMenu(menu);

    const ItemOrSection = ({ item }) =>
      item.type === 'section' ? (
        <MenuSection section={item} />
      ) : (
        <MenuItem item={item} />
      );
    const MenuItem = ({ item }) =>
      item.condition({ user, featureFlags }) ? (
        <NavItem
          isActive={item.active}
          onClick={(e) => {
            item.onclick && item.onclick();
            e.stopPropagation();
          }}
        >
          {item.url && item.external ? (
            <a href={item.url} data-cy={item['data-cy']} target='_blank'>
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
        {items.map((item) => (
          <ItemOrSection key={item.name} item={item} />
        ))}
      </>
    );
    const MenuSection = ({ section }) =>
      section.condition({ user, featureFlags }) ? (
        <NavExpandable
          title={section.name}
          groupId={section.name}
          isActive={section.active}
          isExpanded={menuExpandedSections.includes(section.name)}
        >
          <Menu items={section.items} />
        </NavExpandable>
      ) : null;

    const onToggle = ({ groupId, isExpanded }) => {
      this.setState({
        menuExpandedSections: isExpanded
          ? [...menuExpandedSections, groupId]
          : reject(menuExpandedSections, (name) => name === groupId),
      });
    };

    const Sidebar = (
      <PageSidebar
        theme='dark'
        nav={
          <Nav theme='dark' onToggle={onToggle}>
            <NavList>
              <NavGroup
                className={'nav-title'}
                title={APPLICATION_NAME}
              ></NavGroup>

              {user && featureFlags && <Menu items={menu} />}
            </NavList>
          </Nav>
        }
      />
    );

    // Hide navs on login page
    if (
      this.props.location.pathname === Paths.login ||
      this.props.location.pathname === UI_EXTERNAL_LOGIN_URI
    ) {
      return this.ctx(<Routes updateInitialData={this.updateInitialData} />);
    }

    return this.ctx(
      <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
        {this.state.aboutModalVisible && aboutModal}
        <Routes updateInitialData={this.updateInitialData} />
      </Page>,
    );
  }

  private menu(): any[] {
    const menuItem = (name, options = {}) => ({
      condition: () => true,
      ...options,
      type: 'item',
      name,
    });
    const menuSection = (name, options = {}, items = []) => ({
      condition: (...params) =>
        some(items, (item) => item.condition(...params)), // any visible items inside
      ...options,
      type: 'section',
      name,
      items,
    });

    return [
      menuSection(t`Collections`, {}, [
        menuItem(t`Collections`, {
          url: formatPath(Paths.searchByRepo, {
            repo: this.state.selectedRepo,
          }),
        }),
        menuItem(t`Namespaces`, {
          url: Paths[NAMESPACE_TERM],
        }),
        menuItem(t`Repository Management`, {
          url: Paths.repositories,
        }),
        menuItem(t`API Token`, {
          url: Paths.token,
        }),
        menuItem(t`Approval`, {
          condition: ({ user }) => user.model_permissions.move_collection,
          url: Paths.approvalDashboard,
        }),
      ]),
      menuItem(t`Container Registry`, {
        condition: ({ featureFlags }) => featureFlags.execution_environments,
        url: Paths.executionEnvironments,
      }),
      menuItem(t`Task Management`, {
        url: Paths.taskList,
      }),
      menuItem(t`Documentation`, {
        url: 'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
        external: true,
      }),
      menuSection(t`User Access`, {}, [
        menuItem(t`Users`, {
          condition: ({ user }) => user.model_permissions.view_user,
          url: Paths.userList,
        }),
        menuItem(t`Groups`, {
          condition: ({ user }) => user.model_permissions.view_group,
          url: Paths.groupList,
        }),
      ]),
    ];
  }

  private activateMenu(items) {
    items.forEach(
      (item) =>
        (item.active =
          item.type === 'section'
            ? this.activateMenu(item.items)
            : this.props.location.pathname.startsWith(item.url)),
    );
    return some(items, 'active');
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

  private setRepo = (path: string) => {
    this.props.history.push(path);
  };
}

export default withRouter(App);
