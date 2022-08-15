import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'groups/';
  useOrdering = true;

  listRoles(groupId, params?) {
    return super.list(params, `${this.apiPath}${groupId}/roles/`);
  }

  removeRole(groupId, roleId) {
    return this.http.delete(`${this.apiPath}${groupId}/roles/${roleId}/`);
  }

  addRoleToGroup(groupId, role) {
    return this.http.post(`${this.apiPath}${groupId}/roles/`, {
      role: role.name,
      // required field, can be empty
      content_object: null,
    });
  }
}

export const GroupRoleAPI = new API();
