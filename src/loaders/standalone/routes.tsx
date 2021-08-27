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
  NamespaceDetail,
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
  GroupList,
  GroupDetail,
  RepositoryList,
  ExecutionEnvironmentList,
  ExecutionEnvironmentDetail,
  ExecutionEnvironmentDetailActivities,
  ExecutionEnvironmentDetailImages,
  ExecutionEnvironmentManifest,
  TaskListView,
} from 'src/containers';
import {
  ActiveUserAPI,
  FeatureFlagsAPI,
  FeatureFlagsType,
  UserType,
} from 'src/api';
import { AppContext } from '../app-context';

import { Paths, formatPath } from 'src/paths';

interface IRoutesProps {
  updateInitialData: (
    user: UserType,
    flags: FeatureFlagsType,
    callback?: () => void,
  ) => void;
}

interface IAuthHandlerProps extends RouteComponentProps {
  Component: any;
  noAuth: boolean;
  updateInitialData: (
    user: UserType,
    flags: FeatureFlagsType,
    callback?: () => void,
  ) => void;
  isDisabled: boolean;
}
interface IAuthHandlerState {
  isLoading: boolean;
}

interface IRouteConfig {
  comp: any;
  path: string;
  noAuth?: boolean;
  isDisabled?: boolean;
}

class AuthHandler extends React.Component<
  IAuthHandlerProps,
  IAuthHandlerState
> {
  static contextType = AppContext;
  constructor(props, context) {
    super(props);
    this.state = { isLoading: !context.user };
  }
  componentDidMount() {
    // This component is mounted on every route change, so it's a good place
    // to check for an active user.
    const { user } = this.context;
    if (!user) {
      FeatureFlagsAPI.get()
        .then((featureFlagResponse) => {
          this.props.updateInitialData(null, featureFlagResponse.data);
          return ActiveUserAPI.getUser().then((userResponse) => {
            this.props.updateInitialData(
              userResponse,
              featureFlagResponse.data,
              () => this.setState({ isLoading: false }),
            );
          });
        })
        .catch(() => this.setState({ isLoading: false }));
    }
  }

  render() {
    const { isLoading } = this.state;
    const { Component, noAuth, ...props } = this.props;
    const { user, featureFlags } = this.context;

    let isExternalAuth = false;
    if (featureFlags) {
      isExternalAuth = featureFlags.external_authentication;
    }

    if (isLoading) {
      return null;
    }

    if (!user && !noAuth) {
      if (isExternalAuth && UI_EXTERNAL_LOGIN_URI) {
        window.location.replace(UI_EXTERNAL_LOGIN_URI);
        return <div></div>;
      }
      return (
        <Redirect
          to={formatPath(Paths.login, {}, { next: props.location.pathname })}
        ></Redirect>
      );
    }

    // only enforce this if feature flags are set. Otherwise the container
    // registry will always return a 404 on the first load.
    if (this.props.isDisabled) {
      return <Redirect to={Paths.notFound}></Redirect>;
    }

    return <Component {...props}></Component>;
  }
}

export class Routes extends React.Component<IRoutesProps> {
  static contextType = AppContext;

  // Note: must be ordered from most specific to least specific
  getRoutes(): IRouteConfig[] {
    const { featureFlags } = this.context;
    let isContainerDisabled = true;
    let isUserMgmtDisabled = false;
    if (featureFlags) {
      isContainerDisabled = !featureFlags.execution_environments;
      isUserMgmtDisabled = featureFlags.external_authentication;
    }
    return [
      {
        comp: ExecutionEnvironmentDetailActivities,
        path: Paths.executionEnvironmentDetailActivities,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentManifest,
        path: Paths.executionEnvironmentManifest,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentDetailImages,
        path: Paths.executionEnvironmentDetailImages,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentDetail,
        path: Paths.executionEnvironmentDetail,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentList,
        path: Paths.executionEnvironments,
        isDisabled: isContainerDisabled,
      },
      {
        comp: TaskListView,
        path: Paths.taskList,
      },
      { comp: GroupList, path: Paths.groupList },
      { comp: GroupDetail, path: Paths.groupDetail },
      { comp: RepositoryList, path: Paths.repositories },
      { comp: UserProfile, path: Paths.userProfileSettings },
      {
        comp: UserCreate,
        path: Paths.createUser,
        isDisabled: isUserMgmtDisabled,
      },
      { comp: EditUser, path: Paths.editUser, isDisabled: isUserMgmtDisabled },
      { comp: UserDetail, path: Paths.userDetail },
      { comp: UserList, path: Paths.userList },
      { comp: CertificationDashboard, path: Paths.approvalDashboard },
      { comp: NotFound, path: Paths.notFound },
      { comp: TokenPageStandalone, path: Paths.token },
      { comp: Partners, path: Paths[NAMESPACE_TERM] },
      { comp: EditNamespace, path: Paths.editNamespace },
      { comp: NamespaceDetail, path: Paths.myCollections },
      { comp: NamespaceDetail, path: Paths.myCollectionsByRepo },
      { comp: MyNamespaces, path: Paths.myNamespaces },
      { comp: LoginPage, path: Paths.login, noAuth: true },
      { comp: CollectionDocs, path: Paths.collectionDocsPageByRepo },
      { comp: CollectionDocs, path: Paths.collectionDocsIndexByRepo },
      { comp: CollectionDocs, path: Paths.collectionContentDocsByRepo },
      { comp: CollectionContent, path: Paths.collectionContentListByRepo },
      { comp: CollectionImportLog, path: Paths.collectionImportLogByRepo },
      { comp: CollectionDetail, path: Paths.collectionByRepo },
      { comp: NamespaceDetail, path: Paths.namespaceByRepo },
      { comp: Search, path: Paths.searchByRepo },
      { comp: CollectionDocs, path: Paths.collectionDocsPage },
      { comp: CollectionDocs, path: Paths.collectionDocsIndex },
      { comp: CollectionDocs, path: Paths.collectionContentDocs },
      { comp: CollectionContent, path: Paths.collectionContentList },
      { comp: CollectionImportLog, path: Paths.collectionImportLog },
      { comp: MyImports, path: Paths.myImports },
      { comp: CollectionDetail, path: Paths.collection },
      { comp: NamespaceDetail, path: Paths.namespace },
      { comp: Search, path: Paths.search },
    ];
  }

  render() {
    return (
      <Switch>
        {this.getRoutes().map((route, index) => (
          <Route
            key={index}
            render={(props) => (
              <AuthHandler
                updateInitialData={this.props.updateInitialData}
                noAuth={route.noAuth}
                Component={route.comp}
                isDisabled={route.isDisabled}
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
