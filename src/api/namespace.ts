import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('namespaces/');

  get(id: string, params = {}) {
    // return this.http.get(this.apiPath + id + '/', { params });
    return this.http.get(
      'http://localhost:8002/api/automation-hub/pulp/api/v3/content/ansible/namespaces/',
      { params },
    );
  }
}

export const NamespaceAPI = new API();
