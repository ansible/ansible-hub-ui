import { BaseAPI } from './base';

export class HubAPI extends BaseAPI {
  mapPageToOffset = true; // offset & limit
  sortParam = 'sort';

  constructor() {
    super(API_BASE_PATH);
  }
}
