import { BaseAPI } from './base';

export class API extends BaseAPI {
  apiPath = 'v3/_ui/users/';
  mock: any;

  constructor() {
    super();
  }
}

export const UserAPI = new API();
