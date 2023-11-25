import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = '_ui/v1/feature-flags/';

  get() {
    return this.http.get(this.apiPath);
  }
}

export const FeatureFlagsAPI = new API();
