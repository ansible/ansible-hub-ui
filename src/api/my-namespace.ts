import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = '_ui/v1/my-namespaces/';

  get(id: string, params = {}) {
    return this.http.get(this.apiPath + id + '/', { params });
  }
}

export const MyNamespaceAPI = new API();
