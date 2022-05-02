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
}

export const Repositories = new API();
