import { t } from '@lingui/macro';
import { ParamHelper, ParamType } from 'src/utilities';

export function formatPath(
  path: string,
  data = {},
  params?: ParamType,
  options?,
) {
  // insights router has basename="/", "/beta/" or "/preview/", with hub under a nested "ansible/automation-hub" route - our urls are relative to that
  let url = IS_INSIGHTS
    ? UI_BASE_PATH.replace('/preview/', '/')
        .replace('/beta/', '/')
        .replace(/\/$/, '')
    : '';
  url += (path as string) + '/';
  url = url.replaceAll('//', '/');

  url = url
    .split('/')
    .map((fragment) => {
      const match = fragment.match(/^:(\w+)\??$/);
      if (!match) {
        return fragment;
      }

      const key = match[1];
      if (!data[key]) {
        if (options?.ignoreMissing) {
          // preserve for activateMenu
          return fragment;
        }

        if (!fragment.endsWith('?')) {
          throw new Error(`missing url param ${key}`);
        }

        return '';
      }

      return encodeURIComponent(data[key]);
    })
    .join('/')
    .replaceAll('//', '/');

  return params ? `${url}?${ParamHelper.getQueryString(params)}` : url;
}

// handle long/short EE routes:
// (path, container: 'namespaced/name') -> (path, { namespace: 'namespaced', container: 'name' })
// (path, container: 'simple') -> (path, { container: 'simple' })
// see also containerName
export function formatEEPath(path, data, params?) {
  if (data.container?.includes('/')) {
    const [namespace, container] = data.container.split('/');
    return formatPath(path, { ...data, namespace, container }, params);
  }

  return formatPath(path, data, params);
}

export const Paths = {
  ansibleRemoteDetail: '/ansible/remotes/:name',
  ansibleRemoteEdit: '/ansible/remotes/:name/edit',
  ansibleRemotes: '/ansible/remotes',
  ansibleRepositories: '/ansible/repositories',
  ansibleRepositoryDetail: '/ansible/repositories/:name',
  ansibleRepositoryEdit: '/ansible/repositories/:name/edit',
  approvalDashboard: '/approval-dashboard',
  collectionByRepo: '/repo/:repo/:namespace/:collection',
  collectionContentDocs: '/:namespace/:collection/content/:type/:name',
  collectionContentDocsByRepo:
    '/repo/:repo/:namespace/:collection/content/:type/:name',
  collectionContentList: '/:namespace/:collection/content',
  collectionContentListByRepo: '/repo/:repo/:namespace/:collection/content',
  collectionDependenciesByRepo:
    '/repo/:repo/:namespace/:collection/dependencies',
  collectionDistributionsByRepo:
    '/repo/:repo/:namespace/:collection/distributions',
  collectionDocsIndex: '/:namespace/:collection/docs',
  collectionDocsIndexByRepo: '/repo/:repo/:namespace/:collection/docs',
  collectionDocsPage: '/:namespace/:collection/docs/:page',
  collectionDocsPageByRepo: '/repo/:repo/:namespace/:collection/docs/:page',
  collectionImportLog: '/:namespace/:collection/import-log',
  collectionImportLogByRepo: '/repo/:repo/:namespace/:collection/import-log',
  collections: '/collections',
  createRole: '/roles/create',
  createUser: '/users/create',
  dispatch: '/dispatch',
  editNamespace: '/my-namespaces/edit/:namespace',
  editUser: '/users/:userID/edit',
  executionEnvironmentDetailAccess:
    '/containers/:namespace?/:container/_content/access',
  executionEnvironmentDetailActivities:
    '/containers/:namespace?/:container/_content/activity',
  executionEnvironmentDetailImages:
    '/containers/:namespace?/:container/_content/images',
  executionEnvironmentDetail: '/containers/:namespace?/:container',
  executionEnvironmentManifest:
    '/containers/:namespace?/:container/_content/images/:digest',
  executionEnvironments: '/containers',
  executionEnvironmentsRegistries: '/registries',
  groupDetail: '/group/:group',
  groupList: '/group-list',
  landingPage: '/',
  login: '/login',
  logout: '/logout',
  myCollections: '/my-namespaces/:namespace',
  myCollectionsByRepo: '/repo/:repo/my-namespaces/:namespace',
  myImports: '/my-imports',
  myNamespaces: '/my-namespaces',
  namespace: '/:namespace',
  namespaceByRepo: '/repo/:repo/:namespace',
  namespaceDetail: '/namespaces/:namespace',
  namespaces: IS_INSIGHTS ? '/partners' : '/namespaces',
  notFound: '/not-found',
  roleEdit: '/role/:role',
  roleList: '/roles',
  search: '/search',
  searchByRepo: '/repo/:repo',
  signatureKeys: '/signature-keys',
  standaloneImports: '/standalone/imports',
  standaloneNamespace: '/standalone/namespaces/:namespaceid',
  standaloneNamespaces: '/standalone/namespaces',
  standaloneRole: '/standalone/roles/:namespace/:name/:tab?',
  standaloneRoleImport: '/standalone/roles/import',
  standaloneRoleSync: '/standalone/roles/sync',
  standaloneRoles: '/standalone/roles',
  taskDetail: '/task/:task',
  taskList: '/tasks',
  token: '/token',
  userDetail: '/users/:userID',
  userList: '/users',
  userProfileSettings: '/settings/user-profile',
};

export const namespaceBreadcrumb = () => ({
  name: IS_INSIGHTS ? t`Partners` : t`Namespaces`,
  url: formatPath(Paths.namespaces),
});
