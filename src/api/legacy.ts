import { BaseAPI } from './base';

export class LegacyAPI extends BaseAPI {
  apiBase = API_BASE_PATH;
  mapPageToOffset = false; // using page & page_size
  sortParam = 'order_by';
}
