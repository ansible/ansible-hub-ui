import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = 'v3/_ui/my-synclists/';

  constructor() {
    super();
  }
}

export const MySyncListAPI = new API();
