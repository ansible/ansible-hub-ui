import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  constructor() {
    super(API_HOST + PULP_API_BASE_PATH);
  }
}
