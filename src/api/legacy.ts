import { BaseAPI } from './base';
import { LegacyRoleDetailType } from 'src/api';
import { Constants } from 'src/constants';

export class LegacyAPI extends BaseAPI {
  API_VERSION = 'v1';

  cachedLegacyRole: LegacyRoleDetailType;

  constructor() {
    super(API_HOST + API_BASE_PATH);
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
    params['page_size'] = pageSize;

    return params;
  }

  get(apiPath: string) {
    const fullPath = 'v1/' + apiPath;
    if (fullPath.includes('?')) {
      return this.http.get(this.getPath(fullPath));
    } else {
      return this.http.get(this.getPath(fullPath) + '/');
    }
  }

  getApiPath(url: string) {
    const newUrl = `/${this.API_VERSION}/${url}`;
    return newUrl;
  }
}
