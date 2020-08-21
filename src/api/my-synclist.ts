import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('my-synclists/');

  constructor() {
    super();
  }
}

export const MySyncListAPI = new API();
