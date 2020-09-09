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
  groupDetail = '/group/:group',
  myCollections = '/my-namespaces/:namespace',
  myCollectionsByRepo = '/repo/:repo/my-namespaces/:namespace',
  myNamespaces = '/my-namespaces',
  editNamespace = '/my-namespaces/edit/:namespace',
  myImports = '/my-imports',
  login = '/login',
  logout = '/logout',
  search = '/',
  searchByRepo = '/repo/:repo',
  collectionDocsPage = '/collection/:namespace/:collection/docs/:page',
  collectionDocsIndex = '/collection/:namespace/:collection/docs',
  collectionContentDocs = '/collection/:namespace/:collection/content/:type/:name',
  collectionContentList = '/collection/:namespace/:collection/content',
  collectionImportLog = '/collection/:namespace/:collection/import-log',
  collectionDocsPageByRepo = '/repo/:repo/collection/:namespace/:collection/docs/:page',
  collectionDocsIndexByRepo = '/repo/:repo/collection/:namespace/:collection/docs',
  collectionContentDocsByRepo = '/repo/:repo/collection/:namespace/:collection/content/:type/:name',
  collectionContentListByRepo = '/repo/:repo/collection/:namespace/:collection/content',
  collectionImportLogByRepo = '/repo/:repo/collection/:namespace/:collection/import-log',
  collection = '/collection/:namespace/:collection',
  collectionByRepo = '/repo/:repo/:namespace/:collection',
  namespace = '/namespace/:namespace',
  partners = '/partners',
  notFound = '/not-found',
  token = '/token',
  certificationDashboard = '/certification-dashboard',
  userList = '/users',
  createUser = '/users/create',
  editUser = '/users/:userID/edit',
  userDetail = '/users/:userID',
  userProfileSettings = '/settings/user-profile',
  repositories = '/repositories',
}
