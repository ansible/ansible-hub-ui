import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'tasks/';

  constructor() {
    super();
  }
}

export const TaskManagementAPI = new API();
