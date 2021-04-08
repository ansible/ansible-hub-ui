import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/repositories/');

  constructor() {
    super();
  }

  list(id) {
    return super.list({}, this.apiPath + id + '/_content/history/');
  }
}

export const ActivitiesAPI = new API();
