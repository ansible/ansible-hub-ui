import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = API_HOST;
  constructor() {
    super();
  }
}

export const ApplicationInfoAPI = new API();
