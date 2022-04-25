import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = '';

  get() {
    return super.get('');
  }
}

export const ApplicationInfoAPI = new API();
