import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('namespaces/');
}

export const NamespaceAPI = new API();
