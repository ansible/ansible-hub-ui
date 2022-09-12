import { Route, Switch, Redirect } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Paths } from 'src/paths';
import { LoadingPageWithHeader } from 'src/components';

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
const Partners = lazy(() => import('src/containers/namespace-list/partners'));
const NotFound = lazy(() => import('src/containers/not-found/not-found'));
const Repository = lazy(
  () => import('src/containers/repositories/repository-list'),
);
const Search = lazy(() => import('src/containers/search/search'));
const TaskDetail = lazy(
  () => import('src/containers/task-management/task_detail'),
);
const TaskListView = lazy(
  () => import('src/containers/task-management/task-list-view'),
);
const TokenPage = lazy(() => import('src/containers/token/token-insights'));

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = () => {
  return (
    <Suspense fallback={LoadingPageWithHeader}>
      <Switch>
        <Route path={Paths.repositories} component={Repository} />
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
      </Switch>
    </Suspense>
  );
};

Routes.propTypes = {
  childProps: PropTypes.shape({
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }),
};
