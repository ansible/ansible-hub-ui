import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = 'pulp/api/v3/pulp_container/namespaces/';

  listRoles(id, params?) {
    return super.list(params, this.apiPath + id + '/list_roles/');
  }

  addRole(id, role) {
    return super.create(role, this.apiPath + id + '/add_role/');
  }

  myPermissions(id, params?) {
    return super.list(params, this.apiPath + id + '/my_permissions/');
  }

  removeRole(id, role) {
    return super.create(role, this.apiPath + id + '/remove_role/');
  }
}

export const ExecutionEnvironmentNamespaceAPI = new API();
