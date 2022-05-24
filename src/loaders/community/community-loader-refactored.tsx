import { t, Trans } from '@lingui/macro';
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
import {
  ActiveUserAPI,
  UserType,
  FeatureFlagsType,
  SettingsType,
} from 'src/api';
import {
  AboutModalWindow,
  UIVersion,
  AlertType,
  LoginLink,
  SmallLogo,
  StatefulDropdown,
} from 'src/components';
import { AppContext } from '../app-context';
import Logo from 'src/../static/images/logo_large.svg';

import {
  Menu,
  MenuItem,
  MenuSection,
  onToggle,
} from 'src/loaders/community/menu-components';

interface IState {
  user: UserType;
  selectedRepo: string;
  aboutModalVisible: boolean;
  toggleOpen: boolean;
  featureFlags: FeatureFlagsType;
  menuExpandedSections: string[];
  alerts: AlertType[];
  settings: SettingsType;
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
      alerts: [],
      settings: null,
    };
  }

  componentDidUpdate() {
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

  private isRepoURL = (location) => {
    return matchPath(location, {
      path: Paths.searchByRepo,
    });
  };

  private setAlerts = () => {};

  private setRepo = (path: string) => {
    this.props.history.push(path);
  };

  private setRepoToURL() {
    const match = this.isRepoURL(this.props.location.pathname);
    if (match) {
      if (match.params['repo'] !== this.state.selectedRepo) {
        this.setState({ selectedRepo: match.params['repo'] });
      }
    }
  }

  private setUser = (user: UserType, callback?: () => void) => {
    this.setState({ user: user }, () => {
      if (callback) {
        callback();
      }
    });
  };

  private updateInitialData = (
    data: {
      user?: UserType;
      featureFlags?: FeatureFlagsType;
      settings?: SettingsType;
    },
    callback?: () => void,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    console.log('UPDATEINITIALDATA data', data);
    console.log('UPDATEINITIALDATA callback', callback);

    const match = this.isRepoURL(this.props.location.pathname);
    if (match && match.params['repo'] !== this.state.selectedRepo) {
      return {};
    }

    /*
	this.setState(data as any, () => {
	  if (callback) {
		callback();
	  }
	});
    */
  };

  private ctx(component) {
    return (
      <AppContext.Provider
        value={{
          user: this.state.user,
          setUser: this.setUser,
          selectedRepo: this.state.selectedRepo,
          setRepo: this.setRepo,
          featureFlags: this.state.featureFlags,
          alerts: this.state.alerts,
          setAlerts: this.setAlerts,
          settings: this.state.settings,
        }}
      >
        {component}
        <UIVersion />
      </AppContext.Provider>
    );
  }

  header = () => {
    const docsDropdownItems = [];
    const userDropdownItems = [];

    const userName = 'foobar';
    const user = null;

    return (
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
            {!user || user.is_anonymous ? (
              <LoginLink next={this.props.location.pathname} />
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
  };

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

  menu = () => {
    // this becomes a datastructure suitable for MenuSection ...
    const menuSection = (name, options = {}, items = []) => ({
      active: false,
      condition: (...params) =>
        some(items, (item) => item.condition(...params)), // any visible items inside
      ...options,
      type: 'section',
      name,
      items,
    });

    // this becomes a datastructure suitable for MenuItem ...
    const menuItem = (name, options = {}) => ({
      active: false,
      condition: () => true,
      ...options,
      type: 'item',
      user: this.state.user,
      settings: this.state.settings,
      featureFlags: this.state.featureFlags,
      name,
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
          condition: ({ user }) => !user.is_anonymous,
          url: Paths.repositories,
        }),
        menuItem(t`API token management`, {
          url: Paths.token,
          condition: ({ user }) => !user.is_anonymous,
        }),
        menuItem(t`Approval`, {
          condition: ({ user }) => user.model_permissions.move_collection,
          url: Paths.approvalDashboard,
        }),
      ]),

      menuSection(t`Legacy`, {}, [
        menuItem(t`Community`, {
          url: Paths.legacyUsers,
        }),
        menuItem(t`Roles`, {
          url: Paths.legacyRoles,
        }),
      ]),

      menuItem(t`Documentation`, {
        url: 'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
        external: true,
      }),
      /*
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
      */
    ];
  };

  sidebar() {
    //const menu = [];
    return (
      <PageSidebar
        theme='dark'
        nav={
          <Nav theme='dark' onToggle={onToggle}>
            <NavList>
              <NavGroup
                className={'nav-title'}
                title={APPLICATION_NAME}
              ></NavGroup>

              <Menu items={this.menu()} />
            </NavList>
          </Nav>
        }
      />
    );
  }

  aboutModal = () => {
    return (
      <AboutModalWindow
        isOpen={this.state.aboutModalVisible}
        trademark=''
        brandImageSrc={Logo}
        onClose={() => this.setState({ aboutModalVisible: false })}
        brandImageAlt={t`Galaxy Logo`}
        productName={APPLICATION_NAME}
        user={this.state.user}
        userName={this.state.user.username}
      ></AboutModalWindow>
    );
  };

  render() {
    const match = this.isRepoURL(this.props.location.pathname);
    if (match && match.params['repo'] !== this.state.selectedRepo) {
      return null;
    }

    //this.updateInitialData({})

    return this.ctx(
      <Page
        isManagedSidebar={true}
        header={this.header()}
        sidebar={this.sidebar()}
      >
        {this.state.aboutModalVisible && this.aboutModal()}
        <Routes updateInitialData={this.updateInitialData} />
      </Page>,
    );
  }
}

export default withRouter(App);
