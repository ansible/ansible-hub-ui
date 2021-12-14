import { Route, Switch, Redirect } from 'react-router-dom';
import React from 'react';
import asyncComponent from 'src/utilities/asyncComponent';
import { Paths } from 'src/paths';

const EditNamespace = asyncComponent(() =>
  import(
    /* webpackChunkName: "namespace_detail" */
    '../../containers/edit-namespace/edit-namespace'
  ),
);

const CollectionDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-detail'
  ),
);

const CollectionContent = asyncComponent(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-content'
  ),
);

const CollectionDocs = asyncComponent(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-docs'
  ),
);

const CollectionImportLog = asyncComponent(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-import-log'
  ),
);

const CollectionDependencies = asyncComponent(() =>
  import(
    /* webpackChunkName: "collection_detail" */
    '../../containers/collection-detail/collection-dependencies'
  ),
);

const NotFound = asyncComponent(() =>
  import(
    /* webpackChunkName: "not_found" */
    '../../containers/not-found/not-found'
  ),
);

const MyNamespaces = asyncComponent(() =>
  import(
    /* webpackChunkName: "namespace_list" */
    '../../containers/namespace-list/my-namespaces'
  ),
);

const ManageNamespace = asyncComponent(() =>
  import(
    /* webpackChunkName: "namespace_detail" */
    '../../containers/namespace-detail/namespace-detail'
  ),
);

const PartnerDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "namespace_detail" */
    '../../containers/namespace-detail/namespace-detail'
  ),
);

const Partners = asyncComponent(() =>
  import(
    /* webpackChunkName: "namespace_list" */
    '../../containers/namespace-list/' + NAMESPACE_TERM
  ),
);

const MyImports = asyncComponent(() =>
  import(
    /* webpackChunkName: "my_imports" */
    '../../containers/my-imports/my-imports'
  ),
);

const Search = asyncComponent(() =>
  import(
    /* webpackChunkName: "search" */
    '../../containers/search/search'
  ),
);

const TokenPage = asyncComponent(() =>
  import(
    /* webpackChunkName: "settings" */
    '../../containers/token/token-insights'
  ),
);

const CertificationDashboard = asyncComponent(() =>
  import(
    /* webpackChunkName: "settings" */
    '../../containers/certification-dashboard/certification-dashboard'
  ),
);

const Repository = asyncComponent(() =>
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
export const Routes = (props) => {
  const path = props.childProps.location.pathname;

  return (
    <Switch>
      <Route
        path={Paths.repositories}
        component={Repository}
      />
      <Route
        path={Paths.approvalDashboard}
        component={CertificationDashboard}
      />
      <Route
        path={Paths.notFound}
        component={NotFound}
      />
      <Route
        path={Paths.token}
        component={TokenPage}
      />
      <Route
        path={Paths[NAMESPACE_TERM]}
        component={Partners}
      />
      <Route
        path={Paths.editNamespace}
        component={EditNamespace}
      />
      <Route
        path={Paths.myCollections}
        component={ManageNamespace}
      />
      <Route
        path={Paths.myCollectionsByRepo}
        component={ManageNamespace}
      />
      <Route
        path={Paths.myNamespaces}
        component={MyNamespaces}
      />
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
      <Route
        path={Paths.collectionByRepo}
        component={CollectionDetail}
      />
      <Route
        path={Paths.namespaceByRepo}
        component={PartnerDetail}
      />
      <Route
        path={Paths.searchByRepo}
        component={Search}
      />
      <Route
        path={Paths.collectionDocsPage}
        component={CollectionDocs}
      />
      <Route
        path={Paths.collectionDocsIndex}
        component={CollectionDocs}
      />
      <Route
        path={Paths.collectionContentDocs}
        component={CollectionDocs}
      />
      <Route
        path={Paths.collectionContentList}
        component={CollectionContent}
      />
      <Route
        path={Paths.collectionImportLog}
        component={CollectionImportLog}
      />
      <Route
        path={Paths.myImports}
        component={MyImports}
      />
      <Route
        path={Paths.collection}
        component={CollectionDetail}
      />
      <Route
        path={Paths.namespace}
        component={PartnerDetail}
      />
      <Route path={Paths.search} component={Search} />
      <Route>
        <Redirect push to={Paths.notFound} />
      </Route>
    </Switch>
  );
};
