import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('my-synclists/');

  curate(id) {
    return this.http.post(this.apiPath + id + '/curate/', {});
  }
}

export const MySyncListAPI = new API();
