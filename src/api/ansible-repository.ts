import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'repositories/ansible/ansible/';
  useOrdering = true;

  // list(params?)

  listVersions(uuid, params?) {
    return this.list(params, this.getPath(null) + uuid + '/versions/');
  }

  // delete(uuid)

  sync(id) {
    return this.http.post(this.apiPath + id + '/sync/', {});
  }

  revert(id, version_href) {
    return this.http.post(this.apiPath + id + '/modify/', {
      base_version: version_href,
    });
  }

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

export const AnsibleRepositoryAPI = new API();
