import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  constructor() {
    super('/pulp/api/v3/');
  }
}
