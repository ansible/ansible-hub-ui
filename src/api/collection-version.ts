import axios from 'axios';
import { CollectionVersionSearch } from 'src/api';
import { HubAPI } from './hub';

export class API extends HubAPI {
  // contains collection versions
  cachedCollection: CollectionVersionSearch[] = [];

  apiPath = 'v3/plugin/ansible/search/collection-versions/';

  setRepository(
    namespace: string,
    name: string,
    version: string,
    originalRepo: string,
    destinationRepo: string,
  ) {
    const path = `v3/collections/${namespace}/${name}/versions/${version}/move/${originalRepo}/${destinationRepo}/`;
    return this.create({}, path);
  }

  copyToRepository(
    namespace: string,
    name: string,
    version: string,
    originalRepo: string,
    destinationRepo: string,
  ) {
    const path = `v3/collections/${namespace}/${name}/versions/${version}/copy/${originalRepo}/${destinationRepo}/`;
    return this.create({}, path);
  }

  get(id: string) {
    return super.get(id, 'pulp/api/v3/content/ansible/collection_versions/');
  }

  // Caches the collection returned from the server.
  // collection is array of collection versions
  // If the requested collection matches the cache, return it,
  // if it doesn't, query the API for the collection versions and
  // replace the old cache with the new value.
  // This allows the collection page to be broken into separate components
  // and routed separately without fetching redundant data from the API
  getCached(params, forceReload?: boolean) {
    return new Promise((resolve, reject) => {
      const { name, namespace, repository_name } = params;
      const [collection] = this.cachedCollection;
      if (
        !forceReload &&
        collection &&
        collection.collection_version.name === name &&
        collection.collection_version.namespace === namespace &&
        collection.repository.name === repository_name
      ) {
        return resolve(this.cachedCollection);
      }

      super
        .list(params)
        .then((result) => {
          const { data } = result.data;
          this.cachedCollection = data;
          return resolve(data);
        })
        .catch((err) => reject(err));
    });
  }

  getUsedDependenciesByCollection(
    namespace,
    collection,
    params = {},
    cancelToken = undefined,
  ) {
    return this.http.get(
      `${this.apiPath}?dependency=${namespace}.${collection}`,
      { params: this.mapPageToOffset(params), cancelToken: cancelToken?.token },
    );
  }

  getCancelToken() {
    return axios.CancelToken.source();
  }
}

export const CollectionVersionAPI = new API();
