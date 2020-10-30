import { BaseAPI } from './base';

export class API extends BaseAPI {
  apiPath = 'v3/tasks/';

  constructor() {
    super();
  }
}

export const TaskAPI = new API();
