import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  useOrdering = false; // translate ?sort into ?ordering in list()

  constructor() {
    super(API_HOST + PULP_API_BASE_PATH);
  }

  list(params?, apiPath?) {
    const changedParams = { ...params };
    if (this.useOrdering && changedParams['sort']) {
      changedParams['ordering'] = changedParams['sort'];
      delete changedParams['sort'];
    }
    return super.list(changedParams, apiPath);
  }
}
