import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LoadingPageWithHeader } from 'src/components';
import { Paths } from 'src/paths';

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

const RepositoryList = lazy(
  () => import('src/containers/repositories/repository-list'),
);

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

const TokenPage = lazy(() => import('src/containers/token/token-insights'));

/**
 * changes routes depending on the path
 * https://reactrouter.com/en/main/route/route
 */
export const InsightsRoutes = () => {
  return (
    <Suspense fallback={<LoadingPageWithHeader />}>
      <Routes>
        <Route path={Paths.repositories} element={<RepositoryList />} />
        <Route
          path={Paths.approvalDashboard}
          element={<CertificationDashboard />}
        />
        <Route path={Paths.notFound} element={<NotFound />} />
        <Route path={Paths.token} element={<TokenPage />} />
        <Route path={Paths.partners} element={<Partners />} />
        <Route path={Paths.editNamespace} element={<EditNamespace />} />
        <Route path={Paths.myCollections} element={<NamespaceDetail />} />
        <Route path={Paths.myCollectionsByRepo} element={<NamespaceDetail />} />
        <Route path={Paths.myNamespaces} element={<MyNamespaces />} />
        <Route path={Paths.signatureKeys} element={<SignatureKeysList />} />
        <Route path={Paths.taskList} element={<TaskListView />} />
        <Route path={Paths.taskDetail} element={<TaskDetail />} />
        <Route
          path={Paths.collectionDocsPageByRepo}
          element={<CollectionDocs />}
        />
        <Route
          path={Paths.collectionDocsIndexByRepo}
          element={<CollectionDocs />}
        />
        <Route
          path={Paths.collectionContentDocsByRepo}
          element={<CollectionDocs />}
        />
        <Route
          path={Paths.collectionContentListByRepo}
          element={<CollectionContent />}
        />
        <Route
          path={Paths.collectionImportLogByRepo}
          element={<CollectionImportLog />}
        />
        <Route
          path={Paths.collectionDependenciesByRepo}
          element={<CollectionDependencies />}
        />
        <Route path={Paths.collectionByRepo} element={<CollectionDetail />} />
        <Route path={Paths.namespaceByRepo} element={<NamespaceDetail />} />
        <Route path={Paths.searchByRepo} element={<Search />} />
        <Route path={Paths.collectionDocsPage} element={<CollectionDocs />} />
        <Route path={Paths.collectionDocsIndex} element={<CollectionDocs />} />
        <Route
          path={Paths.collectionContentDocs}
          element={<CollectionDocs />}
        />
        <Route
          path={Paths.collectionContentList}
          element={<CollectionContent />}
        />
        <Route
          path={Paths.collectionImportLog}
          element={<CollectionImportLog />}
        />
        <Route path={Paths.myImports} element={<MyImports />} />
        <Route path={Paths.collection} element={<CollectionDetail />} />
        <Route path={Paths.namespace} element={<NamespaceDetail />} />
        <Route path={Paths.search} element={<Search />} />
        <Route element={<Navigate to={Paths.notFound} />} />
      </Routes>
    </Suspense>
  );
};
