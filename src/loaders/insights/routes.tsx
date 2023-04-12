import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingPageWithHeader } from 'src/components';
import { Paths } from 'src/paths';

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

const CollectionDocs = lazy(
  () => import('src/containers/collection-detail/collection-docs'),
);

const CollectionImportLog = lazy(
  () => import('src/containers/collection-detail/collection-import-log'),
);

const CollectionDistributions = lazy(
  () => import('src/containers/collection-detail/collection-distributions'),
);

const EditNamespace = lazy(
  () => import('src/containers/edit-namespace/edit-namespace'),
);

const MyImports = lazy(() => import('src/containers/my-imports/my-imports'));

const MyNamespaces = lazy(
  () => import('src/containers/namespace-list/my-namespaces'),
);

const NamespaceDetail = lazy(
  () => import('src/containers/namespace-detail/namespace-detail'),
);

const NotFound = lazy(() => import('src/containers/not-found/not-found'));

const Partners = lazy(() => import('src/containers/namespace-list/partners'));

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

const TokenInsights = lazy(() => import('src/containers/token/token-insights'));

const routes = [
  { path: Paths.ansibleRemoteDetail, component: AnsibleRemoteDetail },
  { path: Paths.ansibleRemoteEdit, component: AnsibleRemoteEdit },
  { path: Paths.ansibleRemotes, component: AnsibleRemoteList },
  { path: Paths.ansibleRepositories, component: AnsibleRepositoryList },
  { path: Paths.ansibleRepositoryDetail, component: AnsibleRepositoryDetail },
  { path: Paths.ansibleRepositoryEdit, component: AnsibleRepositoryEdit },
  {
    path: Paths.approvalDashboard,
    component: CertificationDashboard,
  },
  { path: Paths.notFound, component: NotFound },
  { path: Paths.token, component: TokenInsights },
  { path: Paths.partners, component: Partners },
  { path: Paths.editNamespace, component: EditNamespace },
  { path: Paths.myCollections, component: NamespaceDetail },
  { path: Paths.myCollectionsByRepo, component: NamespaceDetail },
  { path: Paths.myNamespaces, component: MyNamespaces },
  { path: Paths.signatureKeys, component: SignatureKeysList },
  { path: Paths.taskList, component: TaskListView },
  { path: Paths.taskDetail, component: TaskDetail },
  {
    path: Paths.collectionDocsPageByRepo,
    component: CollectionDocs,
  },
  {
    path: Paths.collectionDocsIndexByRepo,
    component: CollectionDocs,
  },
  {
    path: Paths.collectionContentDocsByRepo,
    component: CollectionDocs,
  },
  {
    path: Paths.collectionContentListByRepo,
    component: CollectionContent,
  },
  {
    path: Paths.collectionImportLogByRepo,
    component: CollectionImportLog,
  },
  {
    path: Paths.collectionDependenciesByRepo,
    component: CollectionDependencies,
  },
  {
    component: CollectionDistributions,
    path: Paths.collectionDistributionsByRepo,
  },
  { path: Paths.collectionByRepo, component: CollectionDetail },
  { path: Paths.namespaceDetail, component: NamespaceDetail },
  { path: Paths.collections, component: Search },
  { path: Paths.collectionDocsPage, component: CollectionDocs },
  { path: Paths.collectionDocsIndex, component: CollectionDocs },
  {
    path: Paths.collectionContentDocs,
    component: CollectionDocs,
  },
  {
    path: Paths.collectionContentList,
    component: CollectionContent,
  },
  {
    path: Paths.collectionImportLog,
    component: CollectionImportLog,
  },
  { path: Paths.myImports, component: MyImports },
  { path: Paths.namespace, component: NamespaceDetail },
  { path: Paths.collections, component: Search },
  { path: Paths.search, component: Search },
];

/**
 * changes routes depending on the path
 * https://reactrouter.com/en/main/route/route
 */
export const InsightsRoutes = () => {
  return (
    <Suspense fallback={<LoadingPageWithHeader />}>
      <Routes>
        {routes.map(({ component: Component, path }, index) => (
          <Route key={index} path={path} element={<Component path={path} />} />
        ))}
        <Route path='*' element={<NotFound path={null} />} />
      </Routes>
    </Suspense>
  );
};
