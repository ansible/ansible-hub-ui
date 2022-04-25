import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('feature-flags/');

  get() {
    return this.http.get(this.apiPath);
  }
}

export const FeatureFlagsAPI = new API();
