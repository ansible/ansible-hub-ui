import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'tasks/';

  // get(id)
  // list(params)
  // patch(id, data)
}

export const TaskManagementAPI = new API();
