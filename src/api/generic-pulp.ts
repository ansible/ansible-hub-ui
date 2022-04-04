import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = '';

  get(id: string, apiPath?: string) {
    return this.http.get(this.getPath(apiPath) + id);
  }

  list(params) {
    const changedParams = { ...params };
    if (changedParams['sort']) {
      changedParams['ordering'] = changedParams['sort'];
      delete changedParams['sort'];
    }
    return super.list(changedParams);
  }
}

export const GenericPulpAPI = new API();
