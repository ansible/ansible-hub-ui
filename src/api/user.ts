import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = this.getUIPath('users/');
}

export const UserAPI = new API();
