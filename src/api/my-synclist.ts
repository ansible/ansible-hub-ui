import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('my-synclists/');

  constructor() {
    super();
  }

  curate(id) {
    return this.http.post(this.apiPath + id + '/curate/', {});
  }
}

export const MySyncListAPI = new API();
