import { BaseAPI } from './base';

class API extends BaseAPI {
  apiPath = this.getUIPath('groups/');

  constructor() {
    super();
  }
}

export const GroupAPI = new API();
