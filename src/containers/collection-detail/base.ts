import {
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionContentType,
  CollectionVersionSearch,
} from 'src/api';
import { AlertType } from 'src/components';
import { Paths, formatPath } from 'src/paths';

export interface IBaseCollectionState {
  alerts?: AlertType[];
  collection?: CollectionVersionSearch;
  collections?: CollectionVersionSearch[];
  collectionsCount?: number;
  content?: CollectionVersionContentType;
  distroBasePath?: string;
  params: {
    version?: string;
    showing?: string;
    keywords?: string;
  };
}

// Caches the collection data when matching, prevents redundant fetches between collection detail tabs
const cache = {
  repository: null,
  namespace: null,
  name: null,
  version: null,

  collection: null,
  collections: [],
  collectionsCount: 0,
  content: null,
};

export function loadCollection({
  forceReload,
  matchParams,
  navigate,
  setCollection,
  stateParams,
}) {
  const { version } = stateParams;
  const { collection: name, namespace, repo } = matchParams;

  // try loading from cache
  if (
    !forceReload &&
    cache.repository === repo &&
    cache.namespace === namespace &&
    cache.name === name &&
    cache.version === version
  ) {
    setCollection(
      cache.collections,
      cache.collection,
      cache.content,
      cache.collectionsCount,
    );
    return;
  }

  const requestParams = {
    ...(repo ? { repository_name: repo } : {}),
    namespace,
    name,
  };

  const currentVersion = (
    version
      ? CollectionVersionAPI.list({ ...requestParams, version })
      : CollectionVersionAPI.list({ ...requestParams, is_highest: true })
  ).then(({ data }) => data.data[0]);

  const content = currentVersion
    .then((collection) =>
      CollectionAPI.getContent(
        namespace,
        name,
        collection.collection_version.version,
      ),
    )
    .then(({ data: { results } }) => results[0])
    .catch(() => navigate(formatPath(Paths.notFound)));

  // Note: this only provides the first page - containing the latest version, and all items for the version *selector*,
  // but the version *modal* is using a separate call, in CollectionHeader updatePaginationParams
  const versions = CollectionVersionAPI.list({
    ...requestParams,
    order_by: '-version',
    page_size: 10,
  })
    .then(({ data }) => data)
    .catch(() => ({ data: [], meta: { count: 0 } }));

  return Promise.all([versions, currentVersion, content]).then(
    ([
      {
        data: collections,
        meta: { count: collectionsCount },
      },
      collection,
      content,
    ]) => {
      setCollection(collections, collection, content, collectionsCount);

      cache.repository = repo;
      cache.namespace = namespace;
      cache.name = name;
      cache.version = version;

      cache.collection = collection;
      cache.collections = collections;
      cache.collectionsCount = collectionsCount;
      cache.content = content;
    },
  );
}
