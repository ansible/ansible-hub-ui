import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('distributions/');

  constructor() {
    super();
  }
}

export const DistributionAPI = new API();
