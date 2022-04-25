import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = API_HOST;
}

export const ApplicationInfoAPI = new API();
