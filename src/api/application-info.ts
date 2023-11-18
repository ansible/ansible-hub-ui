import { HubAPI } from './hub';

class API extends HubAPI {
  get() {
    return super.get('');
  }
}

export const ApplicationInfoAPI = new API();
