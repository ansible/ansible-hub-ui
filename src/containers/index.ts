import { lazy } from 'react';

export const AnsibleRemoteDetail = lazy(
  () => import('src/containers/ansible-remote/detail'),
);
export const AnsibleRemoteEdit = lazy(
  () => import('src/containers/ansible-remote/edit'),
);
export const AnsibleRemoteList = lazy(
  () => import('src/containers/ansible-remote/list'),
);
export const AnsibleRepositoryDetail = lazy(
  () => import('src/containers/ansible-repository/detail'),
);
export const AnsibleRepositoryEdit = lazy(
  () => import('src/containers/ansible-repository/edit'),
);
export const AnsibleRepositoryList = lazy(
  () => import('src/containers/ansible-repository/list'),
);
export const CertificationDashboard = lazy(
  () =>
    import('src/containers/certification-dashboard/certification-dashboard'),
);
export const CollectionContent = lazy(
  () => import('src/containers/collection-detail/collection-content'),
);
export const CollectionDependencies = lazy(
  () => import('src/containers/collection-detail/collection-dependencies'),
);
export const CollectionDetail = lazy(
  () => import('src/containers/collection-detail/collection-detail'),
);
export const CollectionDistributions = lazy(
  () => import('src/containers/collection-detail/collection-distributions'),
);
export const CollectionDocs = lazy(
  () => import('src/containers/collection-detail/collection-docs'),
);
export const CollectionImportLog = lazy(
  () => import('src/containers/collection-detail/collection-import-log'),
);
export const EditNamespace = lazy(
  () => import('src/containers/edit-namespace/edit-namespace'),
);
export const EditRole = lazy(
  () => import('src/containers/role-management/role-edit'),
);
export const EditUser = lazy(
  () => import('src/containers/user-management/user-edit'),
);
export const ExecutionEnvironmentDetail = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail'
    ),
);
export const ExecutionEnvironmentDetailAccess = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail_access'
    ),
);
export const ExecutionEnvironmentDetailActivities = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail_activities'
    ),
);
export const ExecutionEnvironmentDetailImages = lazy(
  () =>
    import(
      'src/containers/execution-environment-detail/execution_environment_detail_images'
    ),
);
export const ExecutionEnvironmentList = lazy(
  () =>
    import(
      'src/containers/execution-environment-list/execution_environment_list'
    ),
);
export const ExecutionEnvironmentManifest = lazy(
  () =>
    import(
      'src/containers/execution-environment-manifest/execution-environment-manifest'
    ),
);
export const ExecutionEnvironmentRegistryList = lazy(
  () => import('src/containers/execution-environment/registry-list'),
);
export const GroupDetail = lazy(
  () => import('src/containers/group-management/group-detail'),
);
export const GroupList = lazy(
  () => import('src/containers/group-management/group-list'),
);
export const LandingPage = lazy(
  () => import('src/containers/landing/landing-page'),
);
export const LegacyNamespace = lazy(
  () => import('src/containers/legacy-namespaces/legacy-namespace'),
);
export const LegacyNamespaces = lazy(
  () => import('src/containers/legacy-namespaces/legacy-namespaces'),
);
export const LegacyRole = lazy(
  () => import('src/containers/legacy-roles/legacy-role'),
);
export const LegacyRoles = lazy(
  () => import('src/containers/legacy-roles/legacy-roles'),
);
export const LoginPage = lazy(() => import('src/containers/login/login'));
export const MyImports = lazy(
  () => import('src/containers/my-imports/my-imports'),
);
export const MyNamespaces = lazy(
  () => import('src/containers/namespace-list/my-namespaces'),
);
export const NamespaceDetail = lazy(
  () => import('src/containers/namespace-detail/namespace-detail'),
);
export const NotFound = lazy(
  () => import('src/containers/not-found/not-found'),
);
export const Partners = lazy(
  () => import('src/containers/namespace-list/partners'),
);
export const RoleCreate = lazy(
  () => import('src/containers/role-management/role-create'),
);
export const RoleList = lazy(
  () => import('src/containers/role-management/role-list'),
);
export const Search = lazy(() => import('src/containers/search/search'));
export const SignatureKeysList = lazy(
  () => import('src/containers/signature-keys/list'),
);
export const TaskDetail = lazy(
  () => import('src/containers/task-management/task_detail'),
);
export const TaskListView = lazy(
  () => import('src/containers/task-management/task-list-view'),
);
export const TokenInsights = lazy(
  () => import('src/containers/token/token-insights'),
);
export const TokenStandalone = lazy(
  () => import('src/containers/token/token-standalone'),
);
export const UserCreate = lazy(
  () => import('src/containers/user-management/user-create'),
);
export const UserDetail = lazy(
  () => import('src/containers/user-management/user-detail'),
);
export const UserList = lazy(
  () => import('src/containers/user-management/user-list'),
);
export const UserProfile = lazy(
  () => import('src/containers/settings/user-profile'),
);
