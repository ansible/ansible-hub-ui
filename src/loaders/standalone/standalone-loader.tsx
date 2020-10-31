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
  Select,
  SelectOption,
} from '@patternfly/react-core';

import { Routes } from './routes';
import Logo from '../../../static/images/galaxy_logo.svg';
import { Paths, formatPath } from '../../paths';
import { ActiveUserAPI, UserType } from '../../api';
import { StatefulDropdown } from '../../components';
import { AppContext } from '../app-context';
import { Constants } from '../../constants';

interface IState {
  user: UserType;
  selectExpanded: boolean;
  selectedRepo: string;
}

class App extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectExpanded: false,
      selectedRepo: 'published',
    };
  }

  componentDidUpdate(prevProps) {
    const match = matchPath(this.props.location.pathname, {
      path: '/repo/:repo',
    });
    if (match) {
      if (match.params['repo'] !== this.state.selectedRepo) {
        this.setState({ selectedRepo: match.params['repo'] });
      }
    }
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
            ActiveUserAPI.logout().then(() => this.setState({ user: null }))
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
              <NavGroup title='Content'>
                <NavItem className={'nav-select'}>
                  <Select
                    className='nav-select'
                    variant='single'
                    isOpen={this.state.selectExpanded}
                    selections={this.getRepoName(this.state.selectedRepo)}
                    isPlain={false}
                    onToggle={isExpanded => {
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
                  <Link to={Paths.partners}>Namespaces</Link>
                </NavItem>
                <NavItem>
                  <Link to={Paths.myNamespaces}>My Namespaces</Link>
                </NavItem>
              </NavGroup>
              <NavGroup title='Configuration'>
                <NavItem>
                  <Link to={Paths.token}>API Token</Link>
                </NavItem>
                {!!user && user.model_permissions.view_user && (
                  <NavItem>
                    <Link to={Paths.userList}>Users</Link>
                  </NavItem>
                )}
                <NavItem>
                  <Link to={Paths.groupList}>Groups</Link>
                </NavItem>
                {!!user && user.model_permissions.move_collection && (
                  <NavItem>
                    <Link to={Paths.certificationDashboard}>Certification</Link>
                  </NavItem>
                )}
                <NavItem>
                  <Link to={Paths.repositories}>Repo Management</Link>
                </NavItem>
              </NavGroup>
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
        <Routes selectedRepo={this.state.selectedRepo} />
      </Page>,
    );
  }

  private getRepoBasePath(repoName) {
    if (Constants.REPOSITORYNAMES[repoName]) {
      return Constants.REPOSITORYNAMES[repoName];
    }

    return repoName;
  }

  private getRepoName(basePath) {
    const newRepoName = Object.keys(Constants.REPOSITORYNAMES).find(
      key => Constants.REPOSITORYNAMES[key] === basePath,
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

  private setUser = user => {
    this.setState({ user: user });
  };

  private setRepo = repo => {
    this.setState({ selectedRepo: repo });
  };
}

export default withRouter(App);
