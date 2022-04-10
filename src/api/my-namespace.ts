import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('my-namespaces/');

  get(id: string, params = {}) {
    return this.http.get(this.apiPath + id + '/', { params });
  }
}

export const MyNamespaceAPI = new API();
