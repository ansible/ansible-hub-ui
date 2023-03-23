import { PulpAPI } from './pulp';
import { Repository } from './response-types/repositories';

interface GetRepository {
  name: string;
}

interface ReturnRepository {
  data: {
    count: number;
    next: string;
    previous: string;
    results: Repository[];
  };
}

class API extends PulpAPI {
  apiPath = '/repositories/ansible/ansible/';

  getRepository(data: GetRepository): Promise<ReturnRepository> {
    return this.http.get(`${this.apiPath}?name=${data.name}`);
  }

  listApproved(): Promise<Repository[]> {
    async function getAll(self) {
      let list = [];

      let page = 0;
      const pageSize = 100;

      // watchdog, in case something terrible happened, loop maximum of 10 times. I hope 1000 repos limit is enough
      // otherwise, doing more than 10 API calls is not acceptable either
      for (let i = 0; i < 10; i++) {
        const result = await self.http.get(
          `${
            self.apiPath
          }?offset=${page}&limit=${pageSize}&pulp_label_select=${encodeURIComponent(
            'pipeline=approved',
          )}`,
        );

        list = list.concat(result.data.results);
        if (list.length >= result.data.count) {
          return list;
        }

        page += pageSize;
      }
    }

    return getAll(this);
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
