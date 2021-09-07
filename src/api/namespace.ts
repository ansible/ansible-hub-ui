import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('namespaces/');

  constructor() {
    super();
  }

  deleteNamespace(name) {
    return this.http.delete(this.apiPath + name);
  }
}

export const NamespaceAPI = new API();
