import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  apiPath: string;
  http: any;

  constructor() {
    super('/pulp/api/v3/');
  }

  list(params?: object, apiPath?: string) {
    // Pulp specific: replace sort with ordering
    let modifiedParams = this.mapPageToOffset(params);
    modifiedParams['ordering'] = params['sort'];
    delete modifiedParams['sort'];

    return this.http.get(this.getPath(apiPath), {
      params: modifiedParams,
    });
  }
}
