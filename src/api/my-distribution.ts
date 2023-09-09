import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('my-distributions/');
}

export const MyDistributionAPI = new API();
