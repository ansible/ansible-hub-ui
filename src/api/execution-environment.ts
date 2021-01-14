import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'distributions/container/container/';

  constructor() {
    super();
  }
}

export const ExecutionEnvironmentAPI = new API();
