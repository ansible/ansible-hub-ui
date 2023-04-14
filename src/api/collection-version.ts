import axios from 'axios';
import { HubAPI } from './hub';

export class API extends HubAPI {
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

  // list(params?)
}

export const CollectionVersionAPI = new API();
