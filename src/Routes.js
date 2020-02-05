import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import asyncComponent from './utilities/asyncComponent';
import some from 'lodash/some';
import { Paths } from './paths';

/**
 * Aysnc imports of components
 *
 * https://webpack.js.org/guides/code-splitting/
 * https://reactjs.org/docs/code-splitting.html
 *
 * pros:
 *      1) code splitting
 *      2) can be used in server-side rendering
 * cons:
 *      1) nameing chunk names adds unnecessary docs to code,
 *         see the difference with DashboardMap and InventoryDeployments.
 *
 */
const EditNamespace = asyncComponent(() =>
    import(
        /* webpackChunkName: "namespace_detail" */
        './containers/edit-namespace/namespace-form'
    ),
);

const CollectionDetail = asyncComponent(() =>
    import(
        /* webpackChunkName: "collection_detail" */
        './containers/collection-detail/collection-detail'
    ),
);

const CollectionContent = asyncComponent(() =>
    import(
        /* webpackChunkName: "collection_detail" */
        './containers/collection-detail/collection-content'
    ),
);

const CollectionDocs = asyncComponent(() =>
    import(
        /* webpackChunkName: "collection_detail" */
        './containers/collection-detail/collection-docs'
    ),
);

const CollectionImportLog = asyncComponent(() =>
    import(
        /* webpackChunkName: "collection_detail" */
        './containers/collection-detail/collection-import-log'
    ),
);

const NotFound = asyncComponent(() =>
    import(
        /* webpackChunkName: "not_found" */
        './containers/not-found/not-found'
    ),
);

const MyNamespaces = asyncComponent(() =>
    import(
        /* webpackChunkName: "namespace_list" */
        './containers/namespace-list/my-namespaces'
    ),
);

const ManageNamespace = asyncComponent(() =>
    import(
        /* webpackChunkName: "namespace_detail" */
        './containers/namespace-detail/manage-namespace'
    ),
);

const PartnerDetail = asyncComponent(() =>
    import(
        /* webpackChunkName: "namespace_detail" */
        './containers/namespace-detail/partner-detail'
    ),
);

const Partners = asyncComponent(() =>
    import(
        /* webpackChunkName: "namespace_list" */
        './containers/namespace-list/partners'
    ),
);

const MyImports = asyncComponent(() =>
    import(
        /* webpackChunkName: "my_imports" */
        './containers/my-imports/my-imports'
    ),
);

const Search = asyncComponent(() =>
    import(
        /* webpackChunkName: "search" */
        './containers/search/search'
    ),
);

const TokenPage = asyncComponent(() =>
    import(
        /* webpackChunkName: "settings" */
        './containers/token/token'
    ),
);

const CertificationDashboard = asyncComponent(() =>
    import(
        /* webpackChunkName: "settings" */
        './containers/certification-dashboard/certification-dashboard'
    ),
);

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-c-page__main');
    root.setAttribute('role', 'main');

    return <Route {...rest} component={Component} />;
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string,
};

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = props => {
    const path = props.childProps.location.pathname;

    return (
        <Switch>
            <InsightsRoute
                path={Paths.certificationDashboard}
                component={CertificationDashboard}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.notFound}
                component={NotFound}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.token}
                component={TokenPage}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.partners}
                component={Partners}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.editNamespace}
                component={EditNamespace}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.myCollections}
                component={ManageNamespace}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.myNamespaces}
                component={MyNamespaces}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.collectionDocsPage}
                component={CollectionDocs}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.collectionDocsIndex}
                component={CollectionDocs}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.collectionContentDocs}
                component={CollectionDocs}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.collectionContentList}
                component={CollectionContent}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.collectionImportLog}
                component={CollectionImportLog}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.myImports}
                component={MyImports}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.collection}
                component={CollectionDetail}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.namespace}
                component={PartnerDetail}
                rootClass='root'
            />
            <InsightsRoute
                path={Paths.search}
                component={Search}
                rootClass='root'
            />
            {/* Finally, catch all unmatched routes */}
            <Route
                render={() =>
                    some(Paths, p => p === path) ? null : (
                        <Redirect to={Paths.notFound} />
                    )
                }
            />
        </Switch>
    );
};
