import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'groups/';

  listRoles(groupId, params?) {
    return this.http.get(`${this.apiPath}${groupId}/roles/`, {
      params: this.mapPageToOffset(params),
    });
  }

  removeRole(groupId, roleId) {
    return this.http.delete(`${this.apiPath}${groupId}/roles/${roleId}/`);
  }

  addRoleToGroup(groupId, role) {
    return this.http.post(`${this.apiPath}${groupId}/roles/`, {
      role: role.name,
    });
  }
}

export const GroupRoleAPI = new API();
