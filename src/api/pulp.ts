import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  constructor(extendPath?: string) {
    if (extendPath) {
      super(API_HOST + PULP_API_BASE_PATH + extendPath);
    } else {
      super(API_HOST + PULP_API_BASE_PATH);
    }
  }

  list(params?, apiPath?) {
    const changedParams = { ...params };
    if (changedParams['sort']) {
      changedParams['ordering'] = changedParams['sort'];
      delete changedParams['sort'];
    }
    return super.list(changedParams, apiPath);
  }
}
