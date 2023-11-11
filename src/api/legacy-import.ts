import { LegacyAPI } from './legacy';

export class API extends LegacyAPI {
  apiPath = 'v1/imports/';
  sortParam = 'order_by';

  // list(params?)

  import(data) {
    return this.http.post(this.apiPath, data);
  }
}

export const LegacyImportAPI = new API();
