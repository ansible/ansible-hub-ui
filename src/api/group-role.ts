import { PulpAPI } from './pulp';
import { RoleAPI } from './role';
class API extends PulpAPI {
  apiPath = 'groups/';

  constructor() {
    super();
  }

  // TODO: filter out the role that are already assigned to the group (cant be reassigned)
  // FIXME: not_contains in filter params
  // exluce 'core.' results from results?
  // if done this in UI, page, page_size wont work

  async getRolesWithPermissions(id, params?) {
    const assignedRoles = await this.list(
      params,
      this.apiPath + `${id}/roles/`,
    );

    // allow limit 1000
    const allRoles = await RoleAPI.list({ page_size: 1000 });

    return new Promise((resolve, reject) => {
      Promise.all([assignedRoles, allRoles])
        .then(([assigned, all]) => {
          // match roles with assigned roles
          const data = assigned.data.results.map(({ role, pulp_href }) => ({
            ...all['data'].results.find(({ name }) => name === role),

            // swap pulp_href role with assigned pulp_href role
            // to delete the assigned role
            pulp_href,
          }));

          resolve({
            data,
            count: data.length,
          });
        })
        .catch((e) => reject(e));
    });
  }

  removeRole(id, pulpId) {
    return this.http.delete(this.apiPath + `${id}/roles/${pulpId}`);
  }

  addRoleToGroup(id, role, content_object = null) {
    return this.http.post(this.apiPath + `${id}/roles/`, {
      role: role.name,
      content_object,
    });
  }
}

export const GroupRoleAPI = new API();
