import axios from 'axios';
import { ParamHelper } from '../utilities';

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
    return this.http.get(this.getPath(apiPath));
  }

  private getPath(apiPath: string) {
    return apiPath || this.apiPath;
  }
}
