import { LegacyRoleDetailType } from 'src/api';
import { BaseAPI } from './base';

export class LegacyAPI extends BaseAPI {
  API_VERSION = 'v1';

  cachedLegacyRole: LegacyRoleDetailType;

  constructor() {
    super(API_HOST + API_BASE_PATH);
  }

  public mapPageToOffset(p) {
    // override BaseAPI's function to persist page, page_size, etc ...
    return p;
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
