import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('my-distributions/');

  constructor() {
    super();
  }
}

export const MyDistributionAPI = new API();
