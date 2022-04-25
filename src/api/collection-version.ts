import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = this.getUIPath('collection-versions/');

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
}

export const CollectionVersionAPI = new API();
