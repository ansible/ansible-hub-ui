import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('my-distributions/');

  constructor() {
    super();
  }
}

export const MyDistributionAPI = new API();
