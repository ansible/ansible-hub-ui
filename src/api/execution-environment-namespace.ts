import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/namespaces/');

  constructor() {
    super();
  }
}

export const ExecutionEnvironmentNamespaceAPI = new API();
