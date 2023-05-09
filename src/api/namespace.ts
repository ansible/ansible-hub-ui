import { HubAPI } from './hub';

class API extends HubAPI {
  // apiPath = this.getUIPath('namespaces/');
  apiPath =
    'http://localhost:8002/api/automation-hub/pulp/api/v3/content/ansible/namespaces/';

  get(id: string, params = {}) {
    return this.http.get(this.apiPath + id + '/', { params });
  }
}

export const NamespaceAPI = new API();
