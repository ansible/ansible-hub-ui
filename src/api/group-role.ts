import { PulpAPI } from './pulp';
import { RoleAPI } from './role';

class API extends PulpAPI {
  apiPath = 'groups/';

  constructor() {
    super();
  }

  async getRolesWithPermissions(id, params?) {
    const assignedRoles = await this.list(
      params,
      this.apiPath + `${id}/roles/`,
    );

    const allRoles = await RoleAPI.list();

    return new Promise((resolve, reject) => {
      Promise.all([assignedRoles, allRoles])
        .then(([assigned, all]) => {
          // match roles with assigned roles
          const data = assigned.data.results
            .map(({ role, pulp_href }) => {
              const data = all['data'].results.find(
                ({ name }) => name === role,
              );
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

          resolve({
            data,
            count: data.length,
          });
        })
        .catch((e) => reject(e));
    });
  }

  removeRole(id, pulpId) {
    return this.http.delete(this.apiPath + `${id}/roles/${pulpId}/`);
  }

  addRoleToGroup(id, role, content_object = null) {
    return this.http.post(this.apiPath + `${id}/roles/`, {
      role: role.name,
      content_object,
    });
  }
}

export const GroupRoleAPI = new API();
