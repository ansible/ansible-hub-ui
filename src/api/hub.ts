import { Constants } from '../constants';
import { BaseAPI } from './base';

export class HubAPI extends BaseAPI {
  UI_API_VERSION = 'v1';

  apiPath: string;
  http: any;

  // Use this function to get paths in the _ui API. That will ensure the API version
  // gets updated when it changes
  getUIPath(url: string) {
    return `_ui/${this.UI_API_VERSION}/${url}`;
  }

  apiBaseURL() {
    return API_HOST + API_BASE_PATH;
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
}
