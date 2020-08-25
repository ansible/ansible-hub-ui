import { ParamHelper } from './utilities/param-helper';

export function formatPath(path: Paths, data: any, params?: object) {
  let url = path as string;

  for (const k of Object.keys(data)) {
    url = url.replace(':' + k, data[k]);
  }

  if (params) {
    return `${url}?${ParamHelper.getQueryString(params)}`;
  } else {
    return url;
  }
}

export enum Paths {
  groupList = '/group-list',
  myCollections = '/my-namespaces/:namespace',
  myNamespaces = '/my-namespaces',
  editNamespace = '/my-namespaces/edit/:namespace',
  myImports = '/my-imports',
  login = '/login',
  logout = '/logout',
  search = '/',
  collectionDocsPage = '/:namespace/:collection/docs/:page',
  collectionDocsIndex = '/:namespace/:collection/docs',
  collectionContentDocs = '/:namespace/:collection/content/:type/:name',
  collectionContentList = '/:namespace/:collection/content',
  collectionImportLog = '/:namespace/:collection/import-log',
  collection = '/:namespace/:collection',
  namespace = '/:namespace',
  partners = '/partners',
  notFound = '/not-found',
  token = '/token',
  certificationDashboard = '/certification-dashboard',
  userList = '/users',
  createUser = '/users/create',
  editUser = '/users/:userID/edit',
  userDetail = '/users/:userID',
  userProfileSettings = '/settings/user-profile',
}
