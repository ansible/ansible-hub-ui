import { CollectionAPI, CollectionDetailType } from 'src/api';
import { AlertType } from 'src/components';
import { Paths, formatPath } from 'src/paths';

export interface IBaseCollectionState {
  params: {
    version?: string;
    showing?: string;
    keywords?: string;
  };
  collection: CollectionDetailType;
  alerts?: AlertType[];
}

export function loadCollection({
  forceReload,
  matchParams,
  navigate,
  selectedRepo,
  setCollection,
  stateParams,
}) {
  CollectionAPI.getCached(
    matchParams['namespace'],
    matchParams['collection'],
    selectedRepo,
    { ...stateParams, include_related: 'my_permissions' },
    forceReload,
  )
    .then((result) => {
      return CollectionAPI.list(
        {
          name: matchParams['collection'],
        },
        selectedRepo,
      ).then((collections) => {
        result.deprecated = collections.data.data[0].deprecated;
        setCollection(result);
      });
    })
    .catch(() => {
      navigate(formatPath(Paths.notFound));
    });
}
