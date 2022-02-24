import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'roles/';

  list(params) {
    const changedParams = { ...params };
    if (changedParams['sort']) {
      changedParams['ordering'] = changedParams['sort'];
      delete changedParams['sort'];
    }
    return super.list(changedParams);
  }
}

export const RoleManagementAPI = new API();
