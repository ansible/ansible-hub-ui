import '../app.scss';
import '@patternfly/patternfly/patternfly.scss';
import {
  DropdownItem,
  DropdownSeparator,
  Nav,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';
import {
  Link,
  RouteComponentProps,
  matchPath,
  withRouter,
} from 'react-router-dom';
import Logo from 'src/../static/images/logo_large.svg';
import { ActiveUserAPI, UserType } from 'src/api';
import { SmallLogo, StatefulDropdown } from 'src/components';
import { Constants } from 'src/constants';
import { AboutModalWindow } from 'src/containers';
import { Paths, formatPath } from 'src/paths';
import { AppContext } from '../app-context';
import { Routes } from './routes';

interface IState {
  user: UserType;
  selectExpanded: boolean;
  selectedRepo: string;
  aboutModalVisible: boolean;
  toggleOpen: boolean;
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
    };
  }

  componentDidUpdate(prevProps) {
    this.setRepoToURL();
  }

  componentDidMount() {
    this.setRepoToURL();
  }

  render() {
    const { user, selectedRepo } = this.state;

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
              'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/1.2',
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
        logo={
          <Link
            to={formatPath(Paths.searchByRepo, {
              repo: this.state.selectedRepo,
            })}
          >
            <SmallLogo alt={APPLICATION_NAME}></SmallLogo>
          </Link>
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
              <NavItem className={'nav-select'}>
                <Select
                  className='nav-select'
                  variant='single'
                  isOpen={this.state.selectExpanded}
                  selections={this.getRepoName(this.state.selectedRepo)}
                  isPlain={false}
                  onToggle={(isExpanded) => {
                    this.setState({ selectExpanded: isExpanded });
                  }}
                  onSelect={(event, value) => {
                    const originalRepo = this.state.selectedRepo;
                    this.setState(
                      {
                        selectedRepo: this.getRepoBasePath(value.toString()),
                        selectExpanded: false,
                      },
                      () => {
                        this.props.history.push(
                          formatPath(Paths.searchByRepo, {
                            repo: this.getRepoBasePath(value.toString()),
                          }),
                        );
                        // history.go(0) forces a reload of the page
                        this.props.history.go(0);
                      },
                    );
                  }}
                >
                  <SelectOption key={'published'} value={'Published'} />
                  <SelectOption
                    key={'rh-certified'}
                    value={'Red Hat Certified'}
                  />
                  <SelectOption key={'community'} value={'Community'} />
                </Select>
              </NavItem>
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
                <Link to={Paths.namespaces}>Namespaces</Link>
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
        {this.state.aboutModalVisible && aboutModal}
        <Routes selectedRepo={this.state.selectedRepo} />
      </Page>,
    );
  }

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

  private getRepoBasePath(repoName) {
    if (Constants.REPOSITORYNAMES[repoName]) {
      return Constants.REPOSITORYNAMES[repoName];
    }

    return repoName;
  }

  private getRepoName(basePath) {
    const newRepoName = Object.keys(Constants.REPOSITORYNAMES).find(
      (key) => Constants.REPOSITORYNAMES[key] === basePath,
    );

    // allowing the repo to go through even if isn't one that we support so
    // that 404s bubble up naturally from the child components.
    if (!newRepoName) {
      return basePath;
    }
    return newRepoName;
  }

  private ctx(component) {
    return (
      <AppContext.Provider
        value={{
          user: this.state.user,
          setUser: this.setUser,
          selectedRepo: this.state.selectedRepo,
          setRepo: this.setRepo,
        }}
      >
        {component}
      </AppContext.Provider>
    );
  }

  private setUser = (user) => {
    this.setState({ user: user });
  };

  private setRepo = (repo) => {
    this.setState({ selectedRepo: repo });
  };
}

export default withRouter(App);
