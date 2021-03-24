import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/repositories/');

  constructor() {
    super();
  }

  list(id, params) {
    return this.http.get(this.apiPath + id + '/_content/images/', {
      params: this.mapPageToOffset(params),
    });
  }
}

export const ImagesAPI = new API();
