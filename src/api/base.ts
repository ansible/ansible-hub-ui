import axios from 'axios';

export class BaseAPI {
    apiBaseURL = '/';
    apiPath: string;
    http: any;

    constructor() {
        this.http = axios.create({
            baseURL: this.apiBaseURL,
        });
    }

    list(params: object, apiPath?: string) {
        const path = apiPath || this.apiPath;
        return this.http.get(path, params);
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
}
