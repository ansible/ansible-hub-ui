import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/remotes/');

  // list(params?)
  // create(data)
  // get(pk)
  // update(pk, data)

  sync(pk) {
    return this.http.post(this.apiPath + pk + '/sync/', {});
  }
}

export const ExecutionEnvironmentRemoteAPI = new API();
