import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/repositories/');

  constructor() {
    super();
  }

  readme(name) {
    return this.http.get(this.apiPath + name + '/_content/readme/');
  }

  saveReadme(name, readme) {
    return this.http.put(this.apiPath + name + '/_content/readme/', readme);
  }

  image(name, digest) {
    return this.http.get(`${this.apiPath}${name}/_content/images/${digest}/`);
  }
}

export const ExecutionEnvironmentAPI = new API();
