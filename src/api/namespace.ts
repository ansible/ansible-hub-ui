import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'pulp_ansible/namespaces/';

  get(id: string, params = {}) {
    return this.http.get(this.apiPath + id + '/', { params });
  }
}

export const NamespaceAPI = new API();
