import { BaseAPI } from './base';
import { LegacyRoleDetailType } from 'src/api';

export class LegacyAPI extends BaseAPI {
  API_VERSION = 'v1';

  cachedLegacyRole: LegacyRoleDetailType;

  constructor() {
    super(API_HOST + API_BASE_PATH);
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
