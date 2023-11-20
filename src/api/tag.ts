import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = '_ui/v1/tags/';

  listCollections(params) {
    return this.list(params, this.apiPath + 'collections/');
  }

  listRoles(params) {
    return this.list(params, this.apiPath + 'roles/');
  }
}

export const TagAPI = new API();
