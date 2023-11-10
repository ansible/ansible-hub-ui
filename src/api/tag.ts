import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = this.getUIPath('tags/');

  listCollections(params) {
    return this.list(params, this.getPath() + 'collections/');
  }

  listRoles(params) {
    return this.list(params, this.getPath() + 'roles/');
  }
}

export const TagAPI = new API();
