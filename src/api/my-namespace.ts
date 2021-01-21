import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('my-namespaces/');

  constructor() {
    super();
  }
}

export const MyNamespaceAPI = new API();
