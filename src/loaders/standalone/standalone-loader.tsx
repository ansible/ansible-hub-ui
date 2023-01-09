import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import '../app.scss';
import { Link, matchPath, useLocation } from 'react-router-dom';
import '@patternfly/patternfly/patternfly.scss';
import {
  DropdownItem,
  DropdownSeparator,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';

import { StandaloneRoutes } from './routes';
import { StandaloneMenu } from './menu';
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
import { hasPermission } from 'src/utilities';
import { AppContext } from '../app-context';
import Logo from 'src/../static/images/logo_large.svg';

interface IState {
  user: UserType;
  selectedRepo: string;
  aboutModalVisible: boolean;
  toggleOpen: boolean;
  featureFlags: FeatureFlagsType;
  alerts: AlertType[];
  settings: SettingsType;
}

interface IProps {
  location: ReturnType<typeof useLocation>;
}

const isRepoURL = (location) =>
  matchPath({ path: formatPath(Paths.searchByRepo) + '*' }, location);

class App extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectedRepo: 'published',
      aboutModalVisible: false,
      toggleOpen: false,
      featureFlags: null,
      alerts: [],
      settings: null,
    };
  }

  componentDidUpdate() {
    this.setRepoToURL();
  }

  componentDidMount() {
    this.setRepoToURL();
  }

  render() {
    const { featureFlags, selectedRepo, user, settings } = this.state;

    // block the page from rendering if we're on a repo route and the repo in the
    // url doesn't match the current state
    // This gives componentDidUpdate a chance to recognize that route has chnaged
    // and update the internal state to match the route before any pages can
    // redirect the URL to a 404 state.
    const match = isRepoURL(this.props.location.pathname);
    if (match && match.params.repo !== selectedRepo) {
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
            <Link
              to={formatPath(Paths.userProfileSettings)}
            >{t`My profile`}</Link>
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

    const Sidebar = (
      <PageSidebar
        theme='dark'
        nav={
          <StandaloneMenu
            repository={this.state.selectedRepo}
            context={{ user, settings, featureFlags }}
          />
        }
      />
    );

    // Hide navs on login page
    if (
      this.props.location.pathname === formatPath(Paths.login) ||
      this.props.location.pathname === UI_EXTERNAL_LOGIN_URI
    ) {
      return this.ctx(
        <StandaloneRoutes updateInitialData={this.updateInitialData} />,
      );
    }

    return this.ctx(
      <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
        {this.state.aboutModalVisible && aboutModal}
        <StandaloneRoutes updateInitialData={this.updateInitialData} />
      </Page>,
    );
  }

  private updateInitialData = (
    data: {
      user?: UserType;
      featureFlags?: FeatureFlagsType;
      settings?: SettingsType;
    },
    callback?: () => void,
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.setState(data as any, () => {
      if (callback) {
        callback();
      }
    });

  private setRepoToURL() {
    const match = isRepoURL(this.props.location.pathname);
    if (match) {
      if (match.params.repo !== this.state.selectedRepo) {
        this.setState({ selectedRepo: match.params.repo });
      }
    }
  }

  private ctx(component) {
    return (
      <AppContext.Provider
        value={{
          alerts: this.state.alerts,
          featureFlags: this.state.featureFlags,
          selectedRepo: this.state.selectedRepo,
          setAlerts: this.setAlerts,
          setUser: this.setUser,
          settings: this.state.settings,
          user: this.state.user,
          hasPermission: (name) =>
            hasPermission(
              {
                user: this.state.user,
                settings: this.state.settings,
                featureFlags: this.state.featureFlags,
              },
              name,
            ),
        }}
      >
        {component}
        <UIVersion />
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

  private setAlerts = (alerts: AlertType[]) => {
    this.setState({ alerts });
  };
}

const withLocation = (App) => {
  const WithLocation = () => {
    const location = useLocation();
    return <App location={location} />;
  };
  return WithLocation;
};

export default withLocation(App);
