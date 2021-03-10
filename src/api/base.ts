import axios from 'axios';
import { Constants } from 'src/constants';
import { ParamHelper } from 'src/utilities';
import * as Cookies from 'js-cookie';

export class BaseAPI {
  apiPath: string;
  http: any;

  constructor(apiBaseUrl) {
    this.http = axios.create({
      baseURL: apiBaseUrl,
      paramsSerializer: params => ParamHelper.getQueryString(params),
    });

    this.http.interceptors.request.use(request => this.authHandler(request));
  }

  public mapPageToOffset(p) {
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

  list(params?: object, apiPath?: string) {
    // The api uses offset/limit for pagination. I think this is confusing
    // for params on the front end, so we're going to use page/page size
    // for the URL params and just map it to whatever the api expects.

    return this.http.get(this.getPath(apiPath), {
      params: this.mapPageToOffset(params),
    });
  }

  get(id: string, apiPath?: string) {
    return this.http.get(this.getPath(apiPath) + id + '/');
  }

  update(id: string | number, data: any, apiPath?: string) {
    return this.http.put(this.getPath(apiPath) + id + '/', data);
  }

  create(data: any, apiPath?: string) {
    return this.http.post(this.getPath(apiPath), data);
  }

  delete(id: string | number, apiPath?: string) {
    return this.http.delete(this.getPath(apiPath) + id + '/');
  }

  patch(id: string | number, data: any, apiPath?: string) {
    return this.http.patch(this.getPath(apiPath) + id + '/', data);
  }

  getPath(apiPath: string) {
    return apiPath || this.apiPath;
  }

  private async authHandler(request) {
    // This runs before every API request and ensures that the user is
    // authenticated before the request is executed. On most calls it appears
    // to only add ~10ms of latency.
    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      await (window as any).insights.chrome.auth.getUser();
    }
    if (DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE) {
      request.headers['X-CSRFToken'] = Cookies.get('csrftoken');
    }
    return request;
  }
}
