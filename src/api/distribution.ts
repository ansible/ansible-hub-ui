import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('distributions/');

  constructor() {
    super();
  }
}

export const DistributionAPI = new API();
