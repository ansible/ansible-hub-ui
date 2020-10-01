import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = API_HOST;
  constructor() {
    super();
  }
}

export const ApplicationInfoAPI = new API();
