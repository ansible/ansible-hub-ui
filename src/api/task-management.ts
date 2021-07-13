import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'tasks/';

  constructor() {
    super();
  }

  list(params) {
    let changedParams = {...params};
    if (changedParams['sort']) {
      changedParams['ordering'] = changedParams['sort']
      delete changedParams['sort'];
    }
    return super.list(changedParams)
  }
}

export const TaskManagementAPI = new API();
