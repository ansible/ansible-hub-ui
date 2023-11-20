import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = '_ui/v1/my-distributions/';
}

export const MyDistributionAPI = new API();
