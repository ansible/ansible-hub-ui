import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('namespaces/');

  constructor() {
    super();
  }
}

export const NamespaceAPI = new API();
