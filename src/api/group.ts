import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('groups/');

  constructor() {
    super();
  }

  getPermissions(id) {
    return this.http.get(
      this.apiPath + id + '/model-permissions/?limit=100000&offset=0',
    );
  }

  addPermission(id, data) {
    return this.http.post(this.apiPath + id + '/model-permissions/', data);
  }
  removePermission(id, permissionId) {
    return this.http.delete(
      this.apiPath + id + '/model-permissions/' + permissionId,
    );
  }
}

export const GroupAPI = new API();
