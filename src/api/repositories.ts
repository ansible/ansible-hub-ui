import { PulpAPI } from './pulp';
import { AnsibleRepositoryType } from './response-types/ansible-repository';

interface ReturnRepository {
  data: {
    count: number;
    next: string;
    previous: string;
    results: AnsibleRepositoryType[];
  };
}

class API extends PulpAPI {
  apiPath = '/repositories/ansible/ansible/';

  getRepository({ name }: { name: string }): Promise<ReturnRepository> {
    return this.http.get(`${this.apiPath}?name=${name}`);
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
}

export const Repositories = new API();
