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
} from '../../containers';
import { ActiveUserAPI, UserType } from '../../api';

import { Paths, formatPath } from '../../paths';

interface UserProps {
  setUser: (user: UserType) => void;
  user?: UserType;
}

interface IProps extends RouteComponentProps, UserProps {
  Component: any;
  noAuth: boolean;
}
interface IState {
  isLoading: boolean;
}

class AuthHandler extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = { isLoading: !props.user };
  }
  componentDidMount() {
    if (!this.props.user) {
      ActiveUserAPI.getUser()
        .then(result => {
          this.props.setUser(result);
          this.setState({ isLoading: false });
        })
        .catch(() => this.setState({ isLoading: false }));
    }
  }

  render() {
    const { isLoading } = this.state;
    const { Component, noAuth, user, ...props } = this.props;

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

export class Routes extends React.Component<UserProps> {
  routes = [
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
                user={this.props.user}
                setUser={this.props.setUser}
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
