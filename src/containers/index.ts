import { lazy } from 'react';

export const AnsibleRemoteDetail = lazy(
  () => import('./ansible-remote/detail'),
);
export const AnsibleRemoteEdit = lazy(() => import('./ansible-remote/edit'));
export const AnsibleRemoteList = lazy(() => import('./ansible-remote/list'));
export const AnsibleRepositoryDetail = lazy(
  () => import('./ansible-repository/detail'),
);
export const AnsibleRepositoryEdit = lazy(
  () => import('./ansible-repository/edit'),
);
export const AnsibleRepositoryList = lazy(
  () => import('./ansible-repository/list'),
);
export const CertificationDashboard = lazy(
  () => import('./certification-dashboard/certification-dashboard'),
);
export const CollectionContent = lazy(
  () => import('./collection-detail/collection-content'),
);
export const CollectionDependencies = lazy(
  () => import('./collection-detail/collection-dependencies'),
);
export const CollectionDetail = lazy(
  () => import('./collection-detail/collection-detail'),
);
export const CollectionDistributions = lazy(
  () => import('./collection-detail/collection-distributions'),
);
export const CollectionDocs = lazy(
  () => import('./collection-detail/collection-docs'),
);
export const CollectionImportLog = lazy(
  () => import('./collection-detail/collection-import-log'),
);
export const EditNamespace = lazy(
  () => import('./edit-namespace/edit-namespace'),
);
export const EditRole = lazy(() => import('./role-management/role-edit'));
export const EditUser = lazy(() => import('./user-management/user-edit'));
export const ExecutionEnvironmentDetail = lazy(
  () => import('./execution-environment-detail/execution_environment_detail'),
);
export const ExecutionEnvironmentDetailAccess = lazy(
  () =>
    import(
      './execution-environment-detail/execution_environment_detail_access'
    ),
);
export const ExecutionEnvironmentDetailActivities = lazy(
  () =>
    import(
      './execution-environment-detail/execution_environment_detail_activities'
    ),
);
export const ExecutionEnvironmentDetailImages = lazy(
  () =>
    import(
      './execution-environment-detail/execution_environment_detail_images'
    ),
);
export const ExecutionEnvironmentList = lazy(
  () => import('./execution-environment-list/execution_environment_list'),
);
export const ExecutionEnvironmentManifest = lazy(
  () =>
    import('./execution-environment-manifest/execution-environment-manifest'),
);
export const ExecutionEnvironmentRegistryList = lazy(
  () => import('./execution-environment/registry-list'),
);
export const GroupDetail = lazy(
  () => import('./group-management/group-detail'),
);
export const GroupList = lazy(() => import('./group-management/group-list'));
export const LandingPage = lazy(() => import('./landing/landing-page'));
export const LegacyNamespace = lazy(
  () => import('./legacy-namespaces/legacy-namespace'),
);
export const LegacyNamespaces = lazy(
  () => import('./legacy-namespaces/legacy-namespaces'),
);
export const LegacyRole = lazy(() => import('./legacy-roles/legacy-role'));
export const LegacyRoles = lazy(() => import('./legacy-roles/legacy-roles'));
export const LoginPage = lazy(() => import('./login/login'));
export const MyImports = lazy(() => import('./my-imports/my-imports'));
export const MyNamespaces = lazy(
  () => import('./namespace-list/my-namespaces'),
);
export const NamespaceDetail = lazy(
  () => import('./namespace-detail/namespace-detail'),
);
export const NotFound = lazy(() => import('./not-found/not-found'));
export const Partners = lazy(() => import('./namespace-list/partners'));
export const RoleCreate = lazy(() => import('./role-management/role-create'));
export const RoleList = lazy(() => import('./role-management/role-list'));
export const Search = lazy(() => import('./search/search'));
export const SignatureKeysList = lazy(() => import('./signature-keys/list'));
export const TaskDetail = lazy(() => import('./task-management/task_detail'));
export const TaskListView = lazy(
  () => import('./task-management/task-list-view'),
);
export const TokenInsights = lazy(() => import('./token/token-insights'));
export const TokenStandalone = lazy(() => import('./token/token-standalone'));
export const UserCreate = lazy(() => import('./user-management/user-create'));
export const UserDetail = lazy(() => import('./user-management/user-detail'));
export const UserList = lazy(() => import('./user-management/user-list'));
export const UserProfile = lazy(() => import('./settings/user-profile'));
