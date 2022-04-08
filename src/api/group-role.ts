import { PulpAPI } from './pulp';
import { RoleAPI } from './role';

class API extends PulpAPI {
  constructor() {
    super('groups/');
  }

  getRolesWithPermissions(id, params?) {
    const assignedRoles = this.list(params, `${id}/roles/`);

    const allRoles = RoleAPI.list();

    return Promise.all([assignedRoles, allRoles]).then(([assigned, all]) => {
      // match roles with assigned roles
      const results = assigned.data.results
        .map(({ role, pulp_href }) => {
          const data = all['data'].results.find(({ name }) => name === role);
          if (data) {
            return {
              ...data,
              // swap pulp_href role with assigned pulp_href role
              // to delete the assigned role
              pulp_href,
            };
          }
        })
        .filter(Boolean);

      return {
        data: results,
        count: results.length,
      };
    });
  }

  removeRole(id, pulpId) {
    return this.http.delete(`${id}/roles/${pulpId}/`);
  }

  addRoleToGroup(id, role, content_object = null) {
    return this.http.post(`${id}/roles/`, {
      role: role.name,
      content_object,
    });
  }
}

export const GroupRoleAPI = new API();
