import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = '_ui/v1/groups/';
}

export const GroupAPI = new API();
