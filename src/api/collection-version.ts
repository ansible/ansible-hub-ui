import { BaseAPI } from './base';
import { CertificationStatus } from '../api';

export class API extends BaseAPI {
  apiPath = 'v3/_ui/collection-versions/';

  constructor() {
    super();
  }

  setCertifiation(
    namespace: string,
    collection: string,
    version: string,
    certification: CertificationStatus,
  ) {
    const id = `${namespace}/${collection}/${version}/certified`;

    return this.update(id, {
      namespace: namespace,
      name: collection,
      version: version,
      certification: certification,
    });
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
