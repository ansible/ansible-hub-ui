import { BaseAPI } from './base';

export class API extends BaseAPI {
    apiPath = 'v3/_ui/collection-versions/';

    constructor() {
        super();
    }
}

export const CollectionVersionAPI = new API();
