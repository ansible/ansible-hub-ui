import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('namespaces/');

  constructor() {
    super();
  }
}

export const NamespaceAPI = new API();
