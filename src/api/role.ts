import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'roles/';

  updatePermissions(id, data: unknown) {
    return this.http.patch(this.apiPath + id, data);
  }

  // list(params?)

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
      this.apiPath + id + '/model-permissions/' + permissionId + '/',
    );
  }
}

export const RoleAPI = new API();
