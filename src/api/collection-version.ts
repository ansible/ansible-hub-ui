import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = 'v3/plugin/ansible/search/collection-versions/';
  sortParam = 'order_by';

  move(
    namespace: string,
    name: string,
    version: string,
    source_base_path: string,
    destination_base_path: string,
  ) {
    const path = `v3/collections/${namespace}/${name}/versions/${version}/move/${source_base_path}/${destination_base_path}/`;
    return this.create({}, path);
  }

  copy(
    namespace: string,
    name: string,
    version: string,
    source_base_path: string,
    destination_base_path: string,
  ) {
    const path = `v3/collections/${namespace}/${name}/versions/${version}/copy/${source_base_path}/${destination_base_path}/`;
    return this.create({}, path);
  }

  get(id: string) {
    return super.get(id, 'pulp/api/v3/content/ansible/collection_versions/');
  }

  getUsedDependenciesByCollection(namespace, collection, params = {}) {
    return this.http.get(
      this.apiPath + `?dependency=${namespace}.${collection}`,
      this.mapParams(params),
    );
  }

  // list(params?)
}

export const CollectionVersionAPI = new API();
