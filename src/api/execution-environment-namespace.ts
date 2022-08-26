import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = 'pulp/api/v3/pulp_container/namespaces/';

  listRoles(id) {
    return super.list({}, this.apiPath + id + '/list_roles/');
  }

  addRole(id, data) {
    return super.create(data, this.apiPath + id + '/add_role/');
  }

  myPermissions() {}

  removeRole(id, data) {
    return super.create(data, this.apiPath + id + '/remove_role/');
  }
}

export const ExecutionEnvironmentNamespaceAPI = new API();
