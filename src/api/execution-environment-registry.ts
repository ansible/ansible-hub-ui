import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/registries/');
}

export const ExecutionEnvironmentRegistryAPI = new API();
