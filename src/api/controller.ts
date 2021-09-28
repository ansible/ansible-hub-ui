import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = this.getUIPath('controllers/');

  // list(params?)
}

export const ControllerAPI = new API();
