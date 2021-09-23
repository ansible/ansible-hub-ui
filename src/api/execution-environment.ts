import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/repositories/');

  readme(name) {
    return this.http.get(this.apiPath + name + '/_content/readme/');
  }

  saveReadme(name, readme) {
    return this.http.put(this.apiPath + name + '/_content/readme/', readme);
  }

  images(name, params) {
    return this.http.get(this.apiPath + name + '/_content/images/', {
      params: this.mapPageToOffset(params),
    });
  }

  image(name, digest) {
    return this.http.get(`${this.apiPath}${name}/_content/images/${digest}/`);
  }

  tags(name, params) {
    return this.http.get(this.apiPath + name + '/_content/tags/', {
      params: this.mapPageToOffset(params),
    });
  }
}

export const ExecutionEnvironmentAPI = new API();
