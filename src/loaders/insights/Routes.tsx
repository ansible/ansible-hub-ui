import React, { lazy, Suspense } from 'react';
import { Route, Routes, Redirect } from 'react-router-dom';
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
 * the Routes component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const InsightsRoutes = () => {
  return (
    <Suspense fallback={<LoadingPageWithHeader />}>
      <Routes>
        <Route path={Paths.repositories} component={RepositoryList} />
        <Route
          path={Paths.approvalDashboard}
          component={CertificationDashboard}
        />
        <Route path={Paths.notFound} component={NotFound} />
        <Route path={Paths.token} component={TokenPage} />
        <Route path={Paths[NAMESPACE_TERM]} component={Partners} />
        <Route path={Paths.editNamespace} component={EditNamespace} />
        <Route path={Paths.myCollections} component={NamespaceDetail} />
        <Route path={Paths.myCollectionsByRepo} component={NamespaceDetail} />
        <Route path={Paths.myNamespaces} component={MyNamespaces} />
        <Route path={Paths.signatureKeys} component={SignatureKeysList} />
        <Route path={Paths.taskList} component={TaskListView} />
        <Route path={Paths.taskDetail} component={TaskDetail} />
        <Route
          path={Paths.collectionDocsPageByRepo}
          component={CollectionDocs}
        />
        <Route
          path={Paths.collectionDocsIndexByRepo}
          component={CollectionDocs}
        />
        <Route
          path={Paths.collectionContentDocsByRepo}
          component={CollectionDocs}
        />
        <Route
          path={Paths.collectionContentListByRepo}
          component={CollectionContent}
        />
        <Route
          path={Paths.collectionImportLogByRepo}
          component={CollectionImportLog}
        />
        <Route
          path={Paths.collectionDependenciesByRepo}
          component={CollectionDependencies}
        />
        <Route path={Paths.collectionByRepo} component={CollectionDetail} />
        <Route path={Paths.namespaceByRepo} component={NamespaceDetail} />
        <Route path={Paths.searchByRepo} component={Search} />
        <Route path={Paths.collectionDocsPage} component={CollectionDocs} />
        <Route path={Paths.collectionDocsIndex} component={CollectionDocs} />
        <Route path={Paths.collectionContentDocs} component={CollectionDocs} />
        <Route
          path={Paths.collectionContentList}
          component={CollectionContent}
        />
        <Route
          path={Paths.collectionImportLog}
          component={CollectionImportLog}
        />
        <Route path={Paths.myImports} component={MyImports} />
        <Route path={Paths.collection} component={CollectionDetail} />
        <Route path={Paths.namespace} component={NamespaceDetail} />
        <Route path={Paths.search} component={Search} />
        <Route>
          <Redirect push to={Paths.notFound} />
        </Route>
      </Routes>
    </Suspense>
  );
};
