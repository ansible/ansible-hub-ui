import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'repositories/container/container-push/';

  constructor() {
    super();
  }
}

export const ExecutionEnvironmentAPI = new API();
