import axios from 'axios';
import Cookies from 'js-cookie';
import { Constants } from 'src/constants';
import { ParamHelper } from 'src/utilities';

export class BaseAPI {
  apiPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  http: any;
  sortParam = 'sort'; // translate ?sort into sortParam in list()

  constructor(apiBaseUrl) {
    this.http = axios.create({
      baseURL: apiBaseUrl,
      paramsSerializer: {
        serialize: (params) => ParamHelper.getQueryString(params),
      },
    });

    this.http.interceptors.request.use((request) => this.authHandler(request));
  }

  // The api uses offset/limit OR page/page_size for pagination
  // the UI uses page/page size and maps to whatever the api expects
  // (override mapPageToOffset for page)
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

  // The api uses sort/ordering/order_by for sort
  // the UI uses sort and maps to whatever the api expects
  // (set sortParam)
  public mapSort(params) {
    const newParams = { ...params };
    if (newParams['sort'] && this.sortParam !== 'sort') {
      newParams[this.sortParam] = newParams['sort'];
      delete newParams['sort'];
    }
    return newParams;
  }

  list(params?: object, apiPath?: string) {
    return this.http.get(this.getPath(apiPath), {
      params: this.mapSort(this.mapPageToOffset(params)),
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

  getPath(apiPath?: string) {
    return apiPath || this.apiPath;
  }

  private async authHandler(request) {
    // This runs before every API request and ensures that the user is
    // authenticated before the request is executed. On most calls it appears
    // to only add ~10ms of latency.
    if (IS_INSIGHTS) {
      await window.insights.chrome.auth.getUser();
    } else {
      request.headers['X-CSRFToken'] = Cookies.get('csrftoken');
    }
    return request;
  }
}
