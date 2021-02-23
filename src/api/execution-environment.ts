import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/repositories/');

  constructor() {
    super();
  }
}

export const ExecutionEnvironmentAPI = new API();
