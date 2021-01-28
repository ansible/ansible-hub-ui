import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  apiPath: string;
  http: any;

  constructor() {
    super('/pulp/api/v3/');
  }
}
