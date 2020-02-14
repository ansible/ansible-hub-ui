import { BaseAPI } from './base';
import { MockNamespace } from './mocked-responses/namespace';

class API extends BaseAPI {
  apiPath = 'v3/_ui/namespaces/';

  constructor() {
    super();

    // Comment this out to make an actual API request
    // mocked responses will be removed when a real API is available
    // new MockNamespace(this.http, this.apiPath);
  }
}

export const NamespaceAPI = new API();
