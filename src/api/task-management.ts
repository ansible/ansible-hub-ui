import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'tasks/';

  // list(params)
}

export const TaskManagementAPI = new API();
