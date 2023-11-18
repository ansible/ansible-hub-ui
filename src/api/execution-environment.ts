import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = 'v3/plugin/execution-environments/repositories/';

  readme(name) {
    return this.http.get(this.apiPath + `${name}/_content/readme/`);
  }

  saveReadme(name, readme) {
    return this.http.put(this.apiPath + `${name}/_content/readme/`, readme);
  }

  images(name, params) {
    return this.http.get(
      this.apiPath + `${name}/_content/images/`,
      this.mapParams(params),
    );
  }

  image(name, digest) {
    return this.http.get(this.apiPath + `${name}/_content/images/${digest}/`);
  }

  tags(name, params) {
    return this.http.get(
      this.apiPath + `${name}/_content/tags/`,
      this.mapParams(params),
    );
  }

  deleteImage(name, manifest) {
    return this.http.delete(
      this.apiPath + `${name}/_content/images/${manifest}/`,
    );
  }

  deleteExecutionEnvironment(name) {
    return this.http.delete(this.apiPath + `${name}/`);
  }
}

export const ExecutionEnvironmentAPI = new API();
