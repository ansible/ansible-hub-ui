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

    getMyNamespaces(params: object) {
        return this.list(params, 'v3/_ui/my-namespaces/');
    }

    createNamespace(params: object) {
        return this.create(params, 'v3/_ui/namespaces/');
    }
}

export const NamespaceAPI = new API();
