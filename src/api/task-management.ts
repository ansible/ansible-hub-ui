import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'tasks/';
  useOrdering = true;

  // get(id)
  // list(params)
  // patch(id, data)
}

export const TaskManagementAPI = new API();
