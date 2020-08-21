import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('my-namespaces/');

  constructor() {
    super();
  }
}

export const MyNamespaceAPI = new API();
