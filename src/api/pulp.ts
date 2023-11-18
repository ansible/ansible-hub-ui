import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  apiBase = PULP_API_BASE_PATH;
  mapPageToOffset = true; // offset & limit
  sortParam = 'ordering';
}
