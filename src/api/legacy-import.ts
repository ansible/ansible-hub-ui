import { LegacyAPI } from './legacy';

export class API extends LegacyAPI {
  apiPath = 'v1/imports/';
  sortParam = 'order_by';

  getLastSuccessfulRoleImport(roleId) {
    return super.getAbsolute(`?role_id=${roleId}&state=SUCCESS&detail=true&order_by=-created`);
  }
}

export const LegacyImportAPI = new API();
