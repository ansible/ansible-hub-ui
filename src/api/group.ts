import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('groups/');
}

export const GroupAPI = new API();
