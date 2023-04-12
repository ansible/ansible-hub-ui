import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { AlertType } from 'src/components';
import {
  AnsibleRemoteDetail,
  AnsibleRemoteEdit,
  AnsibleRemoteList,
  AnsibleRepositoryDetail,
  AnsibleRepositoryEdit,
  AnsibleRepositoryList,
  CertificationDashboard,
  CollectionContent,
  CollectionDependencies,
  CollectionDetail,
  CollectionDistributions,
  CollectionDocs,
  CollectionImportLog,
  EditNamespace,
  EditRole,
  EditUser,
  ExecutionEnvironmentDetail,
  ExecutionEnvironmentDetailAccess,
  ExecutionEnvironmentDetailActivities,
  ExecutionEnvironmentDetailImages,
  ExecutionEnvironmentList,
  ExecutionEnvironmentManifest,
  ExecutionEnvironmentRegistryList,
  GroupDetail,
  GroupList,
  LegacyNamespace,
  LegacyNamespaces,
  LegacyRole,
  LegacyRoles,
  LoginPage,
  MyImports,
  MyNamespaces,
  NamespaceDetail,
  NotFound,
  Partners,
  RoleCreate,
  RoleList,
  Search,
  SignatureKeysList,
  TaskDetail,
  TaskListView,
  TokenStandalone,
  UserCreate,
  UserDetail,
  UserList,
  UserProfile,
} from 'src/containers';
import { AppContext, useContext } from 'src/loaders/app-context';
import { loadContext } from 'src/loaders/load-context';
import { Paths, formatPath } from 'src/paths';

type UpdateInitialData = (
  data: {
    user?: UserType;
    featureFlags?: FeatureFlagsType;
    settings?: SettingsType;
    alerts?: AlertType[];
  },
  callback?: () => void,
) => void;

interface IRoutesProps {
  updateInitialData: UpdateInitialData;
}

interface IAuthHandlerProps {
  component: React.ElementType;
  isDisabled?: boolean;
  noAuth: boolean;
  updateInitialData: UpdateInitialData;
  path: string;
}

interface IRouteConfig {
  component: React.ElementType;
  path: string;
  noAuth?: boolean;
  isDisabled?: boolean;
}

const AuthHandler = ({
  component: Component,
  isDisabled,
  noAuth,
  path,
  updateInitialData,
}: IAuthHandlerProps) => {
  const { user, settings, featureFlags } = useContext();
  const [isLoading, setLoading] = useState<boolean>(
    !user || !settings || !featureFlags,
  );
  const { pathname } = useLocation();

  useEffect(() => {
    // This component is mounted on every route change, so it's a good place
    // to check for an active user.
    if (user && settings && featureFlags) {
      return;
    }

    loadContext()
      .then((data) => updateInitialData(data))
      .then(() => setLoading(false));
  }, []);

  if (isLoading) {
    return null;
  }

  const isExternalAuth = featureFlags.external_authentication;
  if (!user && !noAuth) {
    // NOTE: also update LoginLink when changing this
    if (isExternalAuth && UI_EXTERNAL_LOGIN_URI) {
      window.location.replace(UI_EXTERNAL_LOGIN_URI);
      return null;
    }

    return <Navigate to={formatPath(Paths.login, {}, { next: pathname })} />;
  }

  // only enforce this if feature flags are set. Otherwise the container
  // registry will always return a 404 on the first load.
  if (isDisabled) {
    return <NotFound path={path} />;
  }

  return <Component path={path} />;
};

export class StandaloneRoutes extends React.Component<IRoutesProps> {
  static contextType = AppContext;

  // Note: must be ordered from most specific to least specific
  getRoutes(): IRouteConfig[] {
    const { featureFlags, user } = this.context;

    let isContainerDisabled = true;
    let isUserMgmtDisabled = false;
    if (featureFlags) {
      isContainerDisabled = !featureFlags.execution_environments;
      isUserMgmtDisabled = featureFlags.external_authentication;
    }

    return [
      {
        component: ExecutionEnvironmentDetailActivities,
        path: Paths.executionEnvironmentDetailActivitiesWithNamespace,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetailAccess,
        path: Paths.executionEnvironmentDetailAccessWithNamespace,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentManifest,
        path: Paths.executionEnvironmentManifestWithNamespace,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetailImages,
        path: Paths.executionEnvironmentDetailImagesWithNamespace,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetail,
        path: Paths.executionEnvironmentDetailWithNamespace,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetailActivities,
        path: Paths.executionEnvironmentDetailActivities,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetailAccess,
        path: Paths.executionEnvironmentDetailAccess,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentManifest,
        path: Paths.executionEnvironmentManifest,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetailImages,
        path: Paths.executionEnvironmentDetailImages,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetail,
        path: Paths.executionEnvironmentDetail,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentList,
        path: Paths.executionEnvironments,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentRegistryList,
        path: Paths.executionEnvironmentsRegistries,
        isDisabled: isContainerDisabled,
      },

      // LEGACY ...
      { component: LegacyNamespace, path: Paths.legacyNamespace },
      { component: LegacyNamespaces, path: Paths.legacyNamespaces },
      { component: LegacyRole, path: Paths.legacyRole },
      { component: LegacyRoles, path: Paths.legacyRoles },

      {
        component: TaskListView,
        path: Paths.taskList,
      },
      { component: GroupList, path: Paths.groupList },
      { component: GroupDetail, path: Paths.groupDetail },
      { component: TaskDetail, path: Paths.taskDetail },
      { component: EditRole, path: Paths.roleEdit },
      {
        component: RoleCreate,
        path: Paths.createRole,
        isDisabled: !user?.is_superuser,
      },
      { component: RoleList, path: Paths.roleList },
      { component: AnsibleRemoteDetail, path: Paths.ansibleRemoteDetail },
      { component: AnsibleRemoteEdit, path: Paths.ansibleRemoteEdit },
      { component: AnsibleRemoteList, path: Paths.ansibleRemotes },
      {
        component: AnsibleRepositoryDetail,
        path: Paths.ansibleRepositoryDetail,
      },
      {
        component: AnsibleRepositoryEdit,
        path: Paths.ansibleRepositoryEdit,
      },
      { component: AnsibleRepositoryList, path: Paths.ansibleRepositories },
      { component: UserProfile, path: Paths.userProfileSettings },
      {
        component: UserCreate,
        path: Paths.createUser,
        isDisabled: isUserMgmtDisabled,
      },
      { component: SignatureKeysList, path: Paths.signatureKeys },
      {
        component: EditUser,
        path: Paths.editUser,
        isDisabled: isUserMgmtDisabled,
      },
      { component: UserDetail, path: Paths.userDetail },
      { component: UserList, path: Paths.userList },
      { component: CertificationDashboard, path: Paths.approvalDashboard },
      { component: NotFound, path: Paths.notFound },
      { component: TokenStandalone, path: Paths.token },
      { component: Partners, path: Paths[NAMESPACE_TERM] },
      { component: EditNamespace, path: Paths.editNamespace },
      { component: NamespaceDetail, path: Paths.myCollections },
      { component: NamespaceDetail, path: Paths.myCollectionsByRepo },
      { component: MyNamespaces, path: Paths.myNamespaces },
      { component: LoginPage, path: Paths.login, noAuth: true },
      { component: CollectionDocs, path: Paths.collectionDocsPageByRepo },
      { component: CollectionDocs, path: Paths.collectionDocsIndexByRepo },
      { component: CollectionDocs, path: Paths.collectionContentDocsByRepo },
      { component: CollectionContent, path: Paths.collectionContentListByRepo },
      { component: CollectionImportLog, path: Paths.collectionImportLogByRepo },
      {
        component: CollectionDistributions,
        path: Paths.collectionDistributionsByRepo,
      },
      {
        component: CollectionDependencies,
        path: Paths.collectionDependenciesByRepo,
      },
      { component: CollectionDetail, path: Paths.collectionByRepo },
      { component: NamespaceDetail, path: Paths.namespaceDetail },
      { component: Search, path: Paths.collections },
      { component: CollectionDocs, path: Paths.collectionDocsPage },
      { component: CollectionDocs, path: Paths.collectionDocsIndex },
      { component: CollectionDocs, path: Paths.collectionContentDocs },
      { component: CollectionContent, path: Paths.collectionContentList },
      { component: CollectionImportLog, path: Paths.collectionImportLog },
      { component: MyImports, path: Paths.myImports },
      { component: NamespaceDetail, path: Paths.namespace },
      { component: Search, path: Paths.collections },
      { component: Search, path: Paths.search },
    ];
  }

  render() {
    const { updateInitialData } = this.props;

    return (
      <Routes>
        {this.getRoutes().map(
          ({ component, isDisabled, noAuth, path }, index) => (
            <Route
              element={
                <AuthHandler
                  component={component}
                  isDisabled={isDisabled}
                  noAuth={noAuth}
                  path={path}
                  updateInitialData={updateInitialData}
                />
              }
              key={index}
              path={path}
            />
          ),
        )}
        <Route
          path='*'
          element={
            <AuthHandler
              component={NotFound}
              noAuth={true}
              path={null}
              updateInitialData={updateInitialData}
            />
          }
        />
      </Routes>
    );
  }
}
