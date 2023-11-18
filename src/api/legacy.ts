import { BaseAPI } from './base';

export class LegacyAPI extends BaseAPI {
  mapPageToOffset = false; // page & page_size
  sortParam = 'order_by';

  constructor() {
    super(API_BASE_PATH);
  }
}
