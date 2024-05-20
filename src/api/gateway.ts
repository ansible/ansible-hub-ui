import { BaseAPI } from './base';

export class GatewayAPI extends BaseAPI {
  mapPageToOffset = false; // page & page_size

  constructor() {
    super('/api/gateway');
  }
}
