import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/repositories/');

  constructor() {
    super();
  }

  list(id) {
    return this.http.get(this.apiPath + id + '/_content/history/');
  }
}

export const ActivitiesAPI = new API();
