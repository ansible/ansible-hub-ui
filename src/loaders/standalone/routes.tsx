import * as React from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';

import {
  CertificationDashboard,
  CollectionContent,
  CollectionDetail,
  CollectionDocs,
  CollectionImportLog,
  EditNamespace,
  LoginPage,
  MyImports,
  ManageNamespace,
  PartnerDetail,
  MyNamespaces,
  Partners,
  NotFound,
  Search,
  TokenPageStandalone,
  UserList,
  EditUser,
  UserDetail,
  UserCreate,
  UserProfile,
  RepositoryList,
} from '../../containers';
import { ActiveUserAPI } from '../../api';
import { AppContext } from '../app-context';

import { Paths, formatPath } from '../../paths';

interface IProps extends RouteComponentProps {
  Component: any;
  noAuth: boolean;
}
interface IState {
  isLoading: boolean;
}

class AuthHandler extends React.Component<IProps, IState> {
  static contextType = AppContext;
  constructor(props, context) {
    super(props);
    this.state = { isLoading: !context.user };
  }
  componentDidMount() {
    const { user, setUser } = this.context;
    if (!user) {
      ActiveUserAPI.getUser()
        .then(result => {
          setUser(result);
          this.setState({ isLoading: false });
        })
        .catch(() => this.setState({ isLoading: false }));
    }
  }

  render() {
    const { isLoading } = this.state;
    const { Component, noAuth, ...props } = this.props;
    const { user } = this.context;

    if (isLoading) {
      return null;
    }

    if (!user && !noAuth) {
      return (
        <Redirect
          to={formatPath(Paths.login, {}, { next: props.location.pathname })}
        ></Redirect>
      );
    }

    return <Component {...props}></Component>;
  }
}

export class Routes extends React.Component<{}> {
  routes = [
    { comp: RepositoryList, path: Paths.repositories },
    { comp: UserProfile, path: Paths.userProfileSettings },
    { comp: UserCreate, path: Paths.createUser },
    { comp: EditUser, path: Paths.editUser },
    { comp: UserDetail, path: Paths.userDetail },
    { comp: UserList, path: Paths.userList },
    { comp: CertificationDashboard, path: Paths.certificationDashboard },
    { comp: NotFound, path: Paths.notFound },
    { comp: TokenPageStandalone, path: Paths.token },
    { comp: Partners, path: Paths.partners },
    { comp: EditNamespace, path: Paths.editNamespace },
    { comp: ManageNamespace, path: Paths.myCollections },
    { comp: MyNamespaces, path: Paths.myNamespaces },
    { comp: LoginPage, path: Paths.login, noAuth: true },
    { comp: CollectionDocs, path: Paths.collectionDocsPage },
    { comp: CollectionDocs, path: Paths.collectionDocsIndex },
    { comp: CollectionDocs, path: Paths.collectionContentDocs },
    { comp: CollectionContent, path: Paths.collectionContentList },
    { comp: CollectionImportLog, path: Paths.collectionImportLog },
    { comp: MyImports, path: Paths.myImports },
    { comp: CollectionDetail, path: Paths.collection },
    { comp: PartnerDetail, path: Paths.namespace },
    { comp: Search, path: Paths.search },
  ];

  render() {
    return (
      <Switch>
        {this.routes.map((route, index) => (
          <Route
            key={index}
            render={props => (
              <AuthHandler
                noAuth={route.noAuth}
                Component={route.comp}
                {...props}
              ></AuthHandler>
            )}
            path={route.path}
          ></Route>
        ))}
      </Switch>
    );
  }
}
