import {
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionContentType,
  CollectionVersionSearch,
} from 'src/api';
import { AlertType } from 'src/components';
import { Paths, formatPath } from 'src/paths';

export interface IBaseCollectionState {
  params: {
    version?: string;
    showing?: string;
    keywords?: string;
  };
  collections?: CollectionVersionSearch[];
  collection?: CollectionVersionSearch;
  content?: CollectionVersionContentType;
  alerts?: AlertType[];
  distroBasePath?: string;
}

export function loadCollection({
  forceReload,
  matchParams,
  navigate,
  setCollection,
  stateParams,
}) {
  const { version } = stateParams;
  const { collection: name, namespace, repo } = matchParams;

  CollectionVersionAPI.getCached(
    {
      ...(repo ? { repository_name: repo } : {}),
      namespace,
      name,
      order_by: '-version',
    },
    forceReload,
  )
    .then((collections: CollectionVersionSearch[]) => {
      const collection = version
        ? collections.find(
            ({ collection_version }) => collection_version.version == version,
          )
        : collections.find((cv) => cv.is_highest);

      CollectionAPI.getContent(
        namespace,
        name,
        collection.collection_version.version,
      ).then((res) => {
        const [content] = res.data.results;
        setCollection(collections, collection, content);
      });
    })
    .catch(() => {
      navigate(formatPath(Paths.notFound));
    });
}
