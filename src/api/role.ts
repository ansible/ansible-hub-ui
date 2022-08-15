import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'roles/';
  useOrdering = true;

  updatePermissions(id, data: unknown) {
    return this.http.patch(this.apiPath + id, data);
  }

  // create(data)
  // get(params?)

  list(params?, for_object_type?) {
    const newParams = { ...params };
    if (for_object_type) {
      // ?for_object_type=/api/automation-hub/pulp/api/v3/.../
      // list visible in http://localhost:8002/api/automation-hub/pulp/api/v3/
      newParams.for_object_type = PULP_API_BASE_PATH + for_object_type + '/';
    }
    return super.list(newParams);
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
      this.apiPath + id + '/model-permissions/' + permissionId + '/',
    );
  }
}

export const RoleAPI = new API();
