import { BaseAPI } from './base';

export class API extends BaseAPI {
    apiPath = 'v3/_ui/me/';
    mock: any;

    constructor() {
        super();
    }

    get() {
        return this.http.get(this.apiPath);
    }
}

export const MeAPI = new API();
