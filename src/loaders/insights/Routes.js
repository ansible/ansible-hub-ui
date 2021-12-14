import { Route, Switch, Redirect } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { Paths } from 'src/paths';

const EditNamespace = lazy(() =>
  import(
    /* webpackChunkName: "namespace_detail" */
    '../../containers/edit-namespace/edit-namespace'
  ),
);

const CollectionDetail = lazy(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-detail'
  ),
);

const CollectionContent = lazy(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-content'
  ),
);

const CollectionDocs = lazy(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-docs'
  ),
);

const CollectionImportLog = lazy(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-import-log'
  ),
);

const CollectionDependencies = lazy(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-dependencies'
  ),
);

const NotFound = lazy(() =>
  import(
    /* webpackChunkName: "not_found" */
    '../../containers/not-found/not-found'
  ),
);

const MyNamespaces = lazy(() =>
  import(
    /* webpackChunkName: "namespace_list" */
    '../../containers/namespace-list/my-namespaces'
  ),
);

const ManageNamespace = lazy(() =>
  import(
    /* webpackChunkName: "namespace_detail" */
    '../../containers/namespace-detail/namespace-detail'
  ),
);

const PartnerDetail = lazy(() =>
  import(
    /* webpackChunkName: "namespace_detail" */
    '../../containers/namespace-detail/namespace-detail'
  ),
);

const Partners = lazy(() =>
  import(
    /* webpackChunkName: "namespace_list" */
    '../../containers/namespace-list/' + NAMESPACE_TERM
  ),
);

const MyImports = lazy(() =>
  import(
    /* webpackChunkName: "my_imports" */
    '../../containers/my-imports/my-imports'
  ),
);

const Search = lazy(() =>
  import(
    /* webpackChunkName: "search" */
    '../../containers/search/search'
  ),
);

const TokenPage = lazy(() =>
  import(
    /* webpackChunkName: "settings" */
    '../../containers/token/token-insights'
  ),
);

const CertificationDashboard = lazy(() =>
  import(
    /* webpackChunkName: "settings" */
    '../../containers/certification-dashboard/certification-dashboard'
  ),
);

const Repository = lazy(() =>
  import(
    /* webpackChunkName: "repository-list" */
    '../../containers/repositories/repository-list'
  ),
);

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
    /**
     * TODO: Add global loader component to the fallback
     */
    <Suspense fallback={null}>
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
        <Route path={Paths.myCollections} component={ManageNamespace} />
        <Route path={Paths.myCollectionsByRepo} component={ManageNamespace} />
        <Route path={Paths.myNamespaces} component={MyNamespaces} />
        <Route path={Paths.collectionDocsPageByRepo} component={CollectionDocs} />
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
        <Route path={Paths.namespaceByRepo} component={PartnerDetail} />
        <Route path={Paths.searchByRepo} component={Search} />
        <Route path={Paths.collectionDocsPage} component={CollectionDocs} />
        <Route path={Paths.collectionDocsIndex} component={CollectionDocs} />
        <Route path={Paths.collectionContentDocs} component={CollectionDocs} />
        <Route path={Paths.collectionContentList} component={CollectionContent} />
        <Route path={Paths.collectionImportLog} component={CollectionImportLog} />
        <Route path={Paths.myImports} component={MyImports} />
        <Route path={Paths.collection} component={CollectionDetail} />
        <Route path={Paths.namespace} component={PartnerDetail} />
        <Route path={Paths.search} component={Search} />
        <Route>
          <Redirect push to={Paths.notFound} />
        </Route>
      </Switch>
    </Suspense>
  );
};
