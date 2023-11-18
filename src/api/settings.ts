import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = '_ui/v1/settings/';

  get() {
    return this.http.get(this.apiPath);
  }
}

export const SettingsAPI = new API();
