import { BaseAPI } from './base';

export class LegacyAPI extends BaseAPI {
  sortParam = 'order_by';

  constructor() {
    super(API_HOST + API_BASE_PATH);
  }

  public mapPageToOffset(p) {
    // override BaseAPI's function to persist page & page_size
    return p;
  }
}
