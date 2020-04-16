import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = 'v3/_ui/synclists/';

  constructor() {
    super();

    // Comment this out to make an actual API request
    // mocked responses will be removed when a real API is available
    // new MockNamespace(this.http, this.apiPath);
  }

  list() {
    return super.list();
  }

  get(id) {
    return super.get(id);
  }

  update(id, data) {
    return super.update(id, data);
  }
}

export const SyncListAPI = new API();
