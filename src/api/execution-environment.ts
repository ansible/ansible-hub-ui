import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'distributions/container/container/';

  constructor() {
    super();
  }

  list() {
    return this.http.get(this.apiPath);
  }
}

export const ExecutionEnvironmentAPI = new API();
