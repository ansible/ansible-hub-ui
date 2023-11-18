import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = '_ui/v1/my-synclists/';

  curate(id) {
    return this.http.post(this.apiPath + id + '/curate/', {});
  }
}

export const MySyncListAPI = new API();
