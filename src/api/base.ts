import axios from 'axios';
import Cookies from 'js-cookie';
import { Constants } from 'src/constants';
import { ParamHelper } from 'src/utilities';

export class BaseAPI {
  apiPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  http: any;

  constructor(apiBaseUrl) {
    this.http = axios.create({
      baseURL: apiBaseUrl,
      paramsSerializer: {
        serialize: (params) => ParamHelper.getQueryString(params),
      },
    });

    this.http.interceptors.request.use((request) => this.authHandler(request));
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

  update(id: string | number, data, apiPath?: string) {
    return this.http.put(this.getPath(apiPath) + id + '/', data);
  }

  create(data, apiPath?: string) {
    return this.http.post(this.getPath(apiPath), data);
  }

  delete(id: string | number, apiPath?: string) {
    return this.http.delete(this.getPath(apiPath) + id + '/');
  }

  patch(id: string | number, data, apiPath?: string) {
    return this.http.patch(this.getPath(apiPath) + id + '/', data);
  }

  getPath(apiPath: string) {
    return apiPath || this.apiPath;
  }

  private async authHandler(request) {
    request.headers['X-CSRFToken'] = Cookies.get('csrftoken');
    return request;
  }
}
