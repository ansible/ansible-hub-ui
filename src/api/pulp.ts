import axios from 'axios';
import { ParamHelper } from '../utilities';
import { Constants } from '../constants';

export class PulpAPI {
  apiBaseURL = '/pulp/api/v3/';

  apiPath: string;
  http: any;

  constructor() {
    this.apiPath = this.apiBaseURL;
    this.http = axios.create({
      baseURL: this.apiBaseURL,
      paramsSerializer: params => ParamHelper.getQueryString(params),
    });
  }

  list(params?: object, apiPath?: string) {
    return this.http.get(this.getPath(apiPath), {
      params: this.mapPageToOffset(params),
    });
  }

  private getPath(apiPath: string) {
    return apiPath || this.apiPath;
  }

  private mapPageToOffset(p) {
    // replace sort with ordering
    const params = { ...p };
    const sort = params['sort'];
    params['ordering'] = sort;
    delete params['sort'];

    return params;
  }
}
