export function formatPath(path: Paths, data: any) {
    let url = path as string;

    for (const k of Object.keys(data)) {
        url = url.replace(':' + k, data[k]);
    }

    return url;
}

export enum Paths {
    myCollections = '/my-namespaces/:namespace',
    myNamespaces = '/my-namespaces/',
    newNamespace = '/my-namespaces/edit/',
    editNamespace = '/my-namespaces/edit/:namespace',
    myImportsNamespace = '/my-imports/:namespace',
    myImports = '/my-imports',
    search = '/search',
    collectionContentDocs = '/:namespace/:collection/:type/:name',
    collectionDocsPage = '/:namepsace/:collection/docs/:page',
    collectionDocsIndex = '/:namespace/:collection/docs',
    collectionContentList = '/:namespace/:collection/content',
    collection = '/:namespace/:collection',
    namespace = '/:namespace',
    notFound = '/not-found',
}
