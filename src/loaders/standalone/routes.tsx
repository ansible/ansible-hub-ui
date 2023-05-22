import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { AlertType, LoadingPageWithHeader } from 'src/components';
import { AppContext, useContext } from 'src/loaders/app-context';
import { loadContext } from 'src/loaders/load-context';
import { Paths, formatPath } from 'src/paths';

const AnsibleRemoteDetail = lazy(
  () => import('src/containers/ansible-remote/detail'),
);
const AnsibleRemoteEdit = lazy(
  () => import('src/containers/ansible-remote/edit'),
);
const AnsibleRemoteList = lazy(
  () => import('src/containers/ansible-remote/list'),
);
const AnsibleRepositoryDetail = lazy(
  () => import('src/containers/ansible-repository/detail'),
);
const AnsibleRepositoryEdit = lazy(
  () => import('src/containers/ansible-repository/edit'),
);
const AnsibleRepositoryList = lazy(
  () => import('src/containers/ansible-repository/list'),
);
const CertificationDashboard = lazy(
  () =>
    import('src/containers/certification-dashboard/certification-dashboard'),
);
const CollectionContent = lazy(
  () => import('src/containers/collection-detail/collection-content'),
);
const CollectionDependencies = lazy(
  () => import('src/containers/collection-detail/collection-dependencies'),
);
const CollectionDetail = lazy(
  () => import('src/containers/collection-detail/collection-detail'),
);
const CollectionDistributions = lazy(
  () => import('src/containers/collection-detail/collection-distributions'),
);
const CollectionDocs = lazy(
  () => import('src/containers/collection-detail/collection-docs'),
);
const CollectionImportLog = lazy(
  () => import('src/containers/collection-detail/collection-import-log'),
);
const EditNamespace = lazy(
  () => import('src/containers/edit-namespace/edit-namespace'),
);
const EditRole = lazy(() => import('src/containers/role-management/role-edit'));
const EditUser = lazy(() => import('src/containers/user-management/user-edit'));
const ExecutionEnvironmentDetail = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail'
    ),
);
const ExecutionEnvironmentDetailAccess = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail_access'
    ),
);
const ExecutionEnvironmentDetailActivities = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail_activities'
    ),
);
const ExecutionEnvironmentDetailImages = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail_images'
    ),
);
const ExecutionEnvironmentList = lazy(
  () =>
    import(
      'src/containers/execution-environment-list/execution_environment_list'
    ),
);
const ExecutionEnvironmentManifest = lazy(
  () =>
    import(
      'src/containers/execution-environment-manifest/execution-environment-manifest'
    ),
);
const ExecutionEnvironmentRegistryList = lazy(
  () => import('src/containers/execution-environment/registry-list'),
);
const GroupDetail = lazy(
  () => import('src/containers/group-management/group-detail'),
);
const GroupList = lazy(
  () => import('src/containers/group-management/group-list'),
);
const LandingPage = lazy(() => import('src/containers/landing/landing-page'));
const LegacyNamespace = lazy(
  () => import('src/containers/legacy-namespaces/legacy-namespace'),
);
const LegacyNamespaces = lazy(
  () => import('src/containers/legacy-namespaces/legacy-namespaces'),
);
const LegacyRole = lazy(
  () => import('src/containers/legacy-roles/legacy-role'),
);
const LegacyRoles = lazy(
  () => import('src/containers/legacy-roles/legacy-roles'),
);
const LoginPage = lazy(() => import('src/containers/login/login'));
const MyImports = lazy(() => import('src/containers/my-imports/my-imports'));
const MyNamespaces = lazy(
  () => import('src/containers/namespace-list/my-namespaces'),
);
const NamespaceDetail = lazy(
  () => import('src/containers/namespace-detail/namespace-detail'),
);
const NotFound = lazy(() => import('src/containers/not-found/not-found'));
const Partners = lazy(() => import('src/containers/namespace-list/partners'));
const RoleCreate = lazy(
  () => import('src/containers/role-management/role-create'),
);
const RoleList = lazy(() => import('src/containers/role-management/role-list'));
const Search = lazy(() => import('src/containers/search/search'));
const SignatureKeysList = lazy(
  () => import('src/containers/signature-keys/list'),
);
const TaskDetail = lazy(
  () => import('src/containers/task-management/task_detail'),
);
const TaskListView = lazy(
  () => import('src/containers/task-management/task-list-view'),
);
const TokenStandalone = lazy(
  () => import('src/containers/token/token-standalone'),
);
const UserCreate = lazy(
  () => import('src/containers/user-management/user-create'),
);
const UserDetail = lazy(
  () => import('src/containers/user-management/user-detail'),
);
const UserList = lazy(() => import('src/containers/user-management/user-list'));
const UserProfile = lazy(() => import('src/containers/settings/user-profile'));

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
      { component: LandingPage, path: Paths.landingPage },
    ];
  }

  render() {
    const { updateInitialData } = this.props;

    return (
      <Suspense fallback={<LoadingPageWithHeader />}>
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
      </Suspense>
    );
  }
}
