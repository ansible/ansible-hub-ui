import { HubAPI } from './hub';

class API extends HubAPI {
  // apiPath = this.getUIPath('namespaces/');
  apiPath = '/pulp/api/v3/pulp_ansible/namespaces/';

  get(id: string, params = {}) {
    return this.http.get(this.apiPath + id + '/', { params });
  }
}

export const NamespaceAPI = new API();
