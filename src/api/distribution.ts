import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('distributions/');
}

export const DistributionAPI = new API();
