import { BaseAPI } from './base';

export class API extends BaseAPI {
  apiPath = 'v3/_ui/collection-versions/';

  constructor() {
    super();
  }

  setRepository(
    namespace: string,
    name: string,
    version: string,
    originalRepo: string,
    destinationRepo: string,
  ) {
    const path = `v3/collections/${namespace}/${name}/versions/${version}/move/${originalRepo}/${destinationRepo}/`;
    const data = {};
    return this.create(data, path);
  }
}

export const CollectionVersionAPI = new API();
