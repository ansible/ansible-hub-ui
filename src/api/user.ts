import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = this.getUIPath('users/');
  mock: any;

  constructor() {
    super();
  }
}

export const UserAPI = new API();
