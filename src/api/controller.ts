import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = '_ui/v1/controllers/';

  // list(params?)
}

export const ControllerAPI = new API();
