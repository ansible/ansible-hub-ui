import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = '_ui/v1/users/';
}

export const UserAPI = new API();
