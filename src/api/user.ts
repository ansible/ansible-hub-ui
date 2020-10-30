import { BaseAPI } from './base';

export class API extends BaseAPI {
  apiPath = this.getUIPath('users/');
  mock: any;

  constructor() {
    super();
  }
}

export const UserAPI = new API();
