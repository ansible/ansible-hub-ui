import { ParamHelper, ParamType } from 'src/utilities';

export function formatPath(path: Paths, data = {}, params?: ParamType) {
  let url = (path as string) + '/';
  url = url.replaceAll('//', '/');

  for (const k of Object.keys(data)) {
    url = url.replace(':' + k, encodeURIComponent(data[k]));
  }

  if (params) {
    const path = `${url}?${ParamHelper.getQueryString(params)}`;
    return path;
  } else {
    return url;
  }
}

// handle long/short EE routes:
// (path, container: 'namespaced/name') -> (pathWithNamespace, { namespace: 'namespaced', container: 'name' })
// (path, container: 'simple') -> (path, { container: 'simple' })
// see also withContainerParamFix
export function formatEEPath(path, data, params?) {
  const pathsWithNamespace = {
    [Paths.executionEnvironmentDetail]:
      Paths.executionEnvironmentDetailWithNamespace,
    [Paths.executionEnvironmentDetailActivities]:
      Paths.executionEnvironmentDetailActivitiesWithNamespace,
    [Paths.executionEnvironmentDetailImages]:
      Paths.executionEnvironmentDetailImagesWithNamespace,
    [Paths.executionEnvironmentDetailAccess]:
      Paths.executionEnvironmentDetailAccessWithNamespace,
    [Paths.executionEnvironmentManifest]:
      Paths.executionEnvironmentManifestWithNamespace,
  };

  if (data.container?.includes('/')) {
    const [namespace, container] = data.container.split('/');
    const pathWithNamespace = pathsWithNamespace[path];
    return formatPath(
      pathWithNamespace,
      { ...data, namespace, container },
      params,
    );
  }

  return formatPath(path, data, params);
}

export enum Paths {
  ansibleRemoteDetail = '/ansible/remotes/:name',
  ansibleRemoteEdit = '/ansible/remotes/:name/edit',
  ansibleRemotes = '/ansible/remotes',
  ansibleRepositories = '/ansible/repositories',
  ansibleRepositoryDetail = '/ansible/repositories/:name',
  ansibleRepositoryEdit = '/ansible/repositories/:name/edit',
  dispatch = '/dispatch',
  executionEnvironmentDetail = '/containers/:container',
  executionEnvironmentDetailWithNamespace = '/containers/:namespace/:container',
  executionEnvironmentDetailActivities = '/containers/:container/_content/activity',
  executionEnvironmentDetailActivitiesWithNamespace = '/containers/:namespace/:container/_content/activity',
  executionEnvironmentDetailImages = '/containers/:container/_content/images',
  executionEnvironmentDetailImagesWithNamespace = '/containers/:namespace/:container/_content/images',
  executionEnvironmentDetailAccess = '/containers/:container/_content/access',
  executionEnvironmentDetailAccessWithNamespace = '/containers/:namespace/:container/_content/access',
  executionEnvironmentManifest = '/containers/:container/_content/images/:digest',
  executionEnvironmentManifestWithNamespace = '/containers/:namespace/:container/_content/images/:digest',
  executionEnvironments = '/containers',
  executionEnvironmentsRegistries = '/registries',
  roleEdit = '/role/:role',
  roleList = '/roles',
  createRole = '/roles/create',
  groupList = '/group-list',
  groupDetail = '/group/:group',
  taskDetail = '/task/:task',
  myCollections = '/my-namespaces/:namespace',
  myNamespaces = '/my-namespaces',
  editNamespace = '/my-namespaces/edit/:namespace',
  myImports = '/my-imports',
  login = '/login',
  logout = '/logout',
  landingPage = '/',
  legacyRole = '/standalone/roles/:username/:name',
  legacyRoles = '/standalone/roles/',
  legacyNamespace = '/standalone/namespaces/:namespaceid',
  legacyNamespaces = '/standalone/namespaces/',
  searchByRepo = '/repo/:repo',
  myCollectionsByRepo = '/repo/:repo/my-namespaces/:namespace',
  collectionByRepo = '/repo/:repo/:namespace/:collection',
  collectionDocsPage = '/:namespace/:collection/docs/:page',
  collectionDocsIndex = '/:namespace/:collection/docs',
  collectionContentDocs = '/:namespace/:collection/content/:type/:name',
  collectionContentList = '/:namespace/:collection/content',
  collectionImportLog = '/:namespace/:collection/import-log',
  collectionDocsPageByRepo = '/repo/:repo/:namespace/:collection/docs/:page',
  collectionDocsIndexByRepo = '/repo/:repo/:namespace/:collection/docs',
  collectionContentDocsByRepo = '/repo/:repo/:namespace/:collection/content/:type/:name',
  collectionContentListByRepo = '/repo/:repo/:namespace/:collection/content',
  collectionImportLogByRepo = '/repo/:repo/:namespace/:collection/import-log',
  collectionDependenciesByRepo = '/repo/:repo/:namespace/:collection/dependencies',
  collectionDistributionsByRepo = '/repo/:repo/:namespace/:collection/distributions',
  namespaceByRepo = '/repo/:repo/:namespace',
  namespace = '/:namespace',
  namespaceDetail = '/namespaces/:namespace',
  namespaces = '/namespaces',
  notFound = '/not-found',
  token = '/token',
  approvalDashboard = '/approval-dashboard',
  userList = '/users',
  createUser = '/users/create',
  editUser = '/users/:userID/edit',
  userDetail = '/users/:userID',
  userProfileSettings = '/settings/user-profile',
  taskList = '/tasks',
  signatureKeys = '/signature-keys',
  collections = '/collections',

  // for compatibility with old beta routes, remove later
  compatLegacyRole = '/legacy/roles/:username/:name',
  compatLegacyRoles = '/legacy/roles/',
  compatLegacyNamespace = '/legacy/namespaces/:namespaceid',
  compatLegacyNamespaces = '/legacy/namespaces/',
}
