import { LegacyAPI } from './legacy';

export class API extends LegacyAPI {
  apiPath = 'v1/roles/';
  sortParam = 'order_by';

  getContent(id) {
    return super.get(id + '/content/');
  }

  getVersions(id) {
    return super.get(id + '/versions/');
  }

  // list(params?)
}

export const LegacyRoleAPI = new API();
