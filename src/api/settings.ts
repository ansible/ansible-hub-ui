import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('settings/');

  constructor() {
    super();
  }

  get() {
    return this.http.get(this.apiPath);
  }
}

export const SettingsAPI = new API();
