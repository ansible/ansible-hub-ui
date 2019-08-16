import { BaseAPI } from './base';
import { MockImport } from './mocked-responses/import';

export class API extends BaseAPI {
    apiPath = '_ui/imports/collections/';
    mock: any;

    constructor() {
        super();

        // Comment this out to make an actual API request
        // mocked responses will be removed when a real API is available
        this.mock = new MockImport(this.http, this.apiPath);
    }

    get(id, path?) {
        // call this to generate more task messages
        this.mock.updateImportDetail();
        return super.get(id, path);
    }
}

export const ImportAPI = new API();
