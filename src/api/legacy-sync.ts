import { LegacyAPI } from './legacy';

export class API extends LegacyAPI {
  apiPath = 'v1/sync/';

  sync(data) {
    return this.http.post(this.apiPath, data);
  }
}

export const LegacySyncAPI = new API();
