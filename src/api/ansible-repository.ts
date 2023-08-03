import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'repositories/ansible/ansible/';
  useOrdering = true;

  // list(params?)

  listVersions(pulp_id: string, params?) {
    return this.list(params, this.apiPath + pulp_id + '/versions/');
  }

  // delete(pulp_id: string)

  sync(pulp_id: string, body = {}) {
    return this.http.post(this.apiPath + pulp_id + '/sync/', body);
  }

  revert(pulp_id: string, version_href) {
    return this.http.post(this.apiPath + pulp_id + '/modify/', {
      base_version: version_href,
    });
  }

  addContent(pulp_id: string, collection_version_hrefs) {
    return this.http.post(this.apiPath + pulp_id + '/modify/', {
      add_content_units: collection_version_hrefs,
    });
  }

  removeContent(pulp_id: string, collection_version_href) {
    return this.http.post(this.apiPath + pulp_id + '/modify/', {
      remove_content_units: [collection_version_href],
    });
  }

  listRoles(pulp_id: string, params?) {
    return super.list(params, this.apiPath + pulp_id + '/list_roles/');
  }

  addRole(pulp_id: string, role) {
    return super.create(role, this.apiPath + pulp_id + '/add_role/');
  }

  myPermissions(pulp_id: string, params?) {
    return super.list(params, this.apiPath + pulp_id + '/my_permissions/');
  }

  removeRole(pulp_id: string, role) {
    return super.create(role, this.apiPath + pulp_id + '/remove_role/');
  }

  copyCollectionVersion(
    pulp_id: string,
    body: {
      collection_versions: string[];
      destination_repositories: string[];
      signing_service?: string;
    },
  ) {
    return this.http.post(
      this.apiPath + pulp_id + '/copy_collection_version/',
      body,
    );
  }

  moveCollectionVersion(
    pulp_id: string,
    body: {
      collection_versions: string[];
      destination_repositories: string[];
      signing_service?: string;
    },
  ) {
    return this.http.post(
      this.apiPath + pulp_id + '/move_collection_version/',
      body,
    );
  }
}

export const AnsibleRepositoryAPI = new API();
