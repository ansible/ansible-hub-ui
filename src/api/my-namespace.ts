import { BaseAPI } from './base';

class API extends BaseAPI {
    apiPath = 'v3/_ui/my-namespaces/';

    constructor() {
        super();
    }
}

export const MyNamespaceAPI = new API();
