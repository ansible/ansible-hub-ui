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
}

export const CollectionVersionAPI = new API();
