import { PulpAPI } from './pulp';
import { Repository } from './response-types/repositories';

interface GetRepository {
  name: string;
}

class API extends PulpAPI {
  apiPath = '/repositories/ansible/ansible/';

  getRepository(data: GetRepository): Repository {
    return this.http.get(`${this.apiPath}?name=${data.name}`);
  }
}

export const Repositories = new API();
