import { LegacyAPI } from './legacy';

export class API extends LegacyAPI {
  apiPath = 'v1/namespaces/';
  sortParam = 'sort';

  // get(id)
  // list(params?)

  changeProvider(role_namespace_id, collection_namespace_id) {
    return this.http.post(this.apiPath + `${role_namespace_id}/providers/`, {
      id: collection_namespace_id,
    });
  }
}

export const LegacyNamespaceAPI = new API();
