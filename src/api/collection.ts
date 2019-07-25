import { BaseAPI } from './base';
import { MockCollection } from './mocked-responses/collection';

export class API extends BaseAPI {
    apiPath = 'api/collections/';

    constructor() {
        super();

        // Comment this out to make an actual API request
        // mocked responses will be removed when a real API is available
        new MockCollection(this.http, this.apiPath);
    }
}

export const CollectionAPI = new API();
