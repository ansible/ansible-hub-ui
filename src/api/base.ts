import axios from 'axios';
import { Constants } from '../constants';

export class BaseAPI {
    apiBaseURL = '/';
    apiPath: string;
    http: any;

    constructor() {
        this.http = axios.create({
            baseURL: this.apiBaseURL,
        });
    }

    list(params?: object, apiPath?: string) {
        const path = apiPath || this.apiPath;

        // The api uses offset/limit for pagination. I think this is confusing
        // for params on the front end, so we're going to use page/page size
        // for the URL params and just map it to whatever the api expects.
        return this.http.get(path, { params: this.mapPageToOffset(params) });
    }

    get(id: string, apiPath?: string) {
        const path = apiPath || this.apiPath;
        return this.http.get(path + id + '/');
    }

    update(id: string, data: any, apiPath?: string) {
        const path = apiPath || this.apiPath;
        return this.http.put(path + id + '/', data);
    }

    create(data: any, apiPath?: string) {
        const path = apiPath || this.apiPath;
        return this.http.post(path, data);
    }

    private mapPageToOffset(p) {
        // Need to copy the object to make sure we aren't accidentally
        // setting page state
        const params = { ...p };

        const pageSize =
            parseInt(params['page_size']) || Constants.DEFAULT_PAGE_SIZE;
        const page = parseInt(params['page']) || 1;

        delete params['page'];
        delete params['page_size'];

        params['offset'] = page * pageSize - pageSize;
        params['limit'] = pageSize;

        return params;
    }
}
