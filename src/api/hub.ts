import { BaseAPI } from './base';

export class HubAPI extends BaseAPI {
  apiBase = API_BASE_PATH;
  mapPageToOffset = true; // offset & limit
  sortParam = 'sort';
}
