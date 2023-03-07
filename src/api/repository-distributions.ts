import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = '/distributions/ansible/ansible/';
}

export const RepositoryDistributionsAPI = new API();
