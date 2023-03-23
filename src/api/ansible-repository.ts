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
}

export const AnsibleRepositoryAPI = new API();
