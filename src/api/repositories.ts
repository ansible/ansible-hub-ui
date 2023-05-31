import { PulpAPI } from './pulp';
import { RepositoryType } from './response-types/repositories';

interface GetRepository {
  name: string;
}

interface ReturnRepository {
  data: {
    count: number;
    next: string;
    previous: string;
    results: RepositoryType[];
  };
}

class API extends PulpAPI {
  apiPath = '/repositories/ansible/ansible/';
  useOrdering = true;

  getRepository(data: GetRepository): Promise<ReturnRepository> {
    return this.http.get(`${this.apiPath}?name=${data.name}`);
  }

  list(params?) {
    return super.list(params, this.apiPath);
  }

  copyCollectionVersion(
    pulp_id: string,
    collection_versions: string[],
    destination_repositories: string[],
    signing_service?: string,
  ) {
    const params = {
      collection_versions,
      destination_repositories,
    };
    if (signing_service) {
      params['signing_service'] = signing_service;
    }

    return this.http.post(
      this.apiPath + `${pulp_id}/copy_collection_version/`,
      params,
    );
  }

  moveCollectionVersion(
    pulp_id: string,
    collection_versions: string[],
    destination_repositories: string[],
    signing_service?: string,
  ) {
    const params = {
      collection_versions,
      destination_repositories,
    };
    if (signing_service) {
      params['signing_service'] = signing_service;
    }

    return this.http.post(
      this.apiPath + `${pulp_id}/move_collection_version/`,
      params,
    );
  }

  modify(
    pulp_id: string,
    add_content_units: string[],
    remove_content_units: string[],
    base_version: string,
  ) {
    const params = {
      add_content_units,
      remove_content_units,
      base_version,
    };

    return this.http.post(this.apiPath + `${pulp_id}/modify/`, params);
  }

  listVersions(uuid, params?) {
    return super.list(params, this.getPath(null) + uuid + '/versions/');
  }

  // delete(uuid)

  sync(id, body = {}) {
    return this.http.post(this.apiPath + id + '/sync/', body);
  }

  revert(id, version_href) {
    return this.http.post(this.apiPath + id + '/modify/', {
      base_version: version_href,
    });
  }

  addContent(id, collection_version_hrefs) {
    return this.http.post(this.apiPath + id + '/modify/', {
      add_content_units: collection_version_hrefs,
    });
  }

  removeContent(id, collection_version_href) {
    return this.http.post(this.apiPath + id + '/modify/', {
      remove_content_units: [collection_version_href],
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

export const Repositories = new API();
