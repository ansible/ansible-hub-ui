import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingPageWithHeader } from 'src/components';
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
  MyImports,
  MyNamespaces,
  NamespaceDetail,
  NotFound,
  Partners,
  Search,
  SignatureKeysList,
  TaskDetail,
  TaskListView,
  TokenInsights,
} from 'src/containers';
import { Paths } from 'src/paths';

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
  { path: '/', component: Search },
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
