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
  selectedRepo,
  setCollection,
  stateParams,
}) {
  const { version } = stateParams;
  CollectionVersionAPI.getCached(
    {
      repository_name: selectedRepo,
      namespace: matchParams['namespace'],
      name: matchParams['collection'],
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

      // TODO: cache the content as well
      CollectionAPI.getContent(
        matchParams['namespace'],
        matchParams['collection'],
        collection.collection_version.version,
      ).then((res) => {
        const content = res.data.results[0];
        setCollection(collections, collection, content);
      });
    })
    .catch(() => {
      navigate(formatPath(Paths.notFound));
    });
}
