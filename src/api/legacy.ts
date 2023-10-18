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

  list(params?, apiPath?) {
    const newParams = { ...params };
    if (newParams['sort'] && this.sortParam !== 'sort') {
      newParams[this.sortParam] = newParams['sort'];
      delete newParams['sort'];
    }

    return super.list(newParams, apiPath);
  }
}
