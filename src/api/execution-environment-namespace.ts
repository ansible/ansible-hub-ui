import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/namespaces/');
}

export const ExecutionEnvironmentNamespaceAPI = new API();
