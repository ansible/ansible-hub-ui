import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('settings/');

  get() {
    return this.http.get(this.apiPath);
  }
}

export const SettingsAPI = new API();
