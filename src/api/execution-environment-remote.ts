import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/remotes/');

  // list(params?)
  // create(data)
  // get(pk)
  // update(pk, data)

  sync(name) {
    const apiPath = this.getUIPath('execution-environments/repositories/');
    return this.http.post(apiPath + name + '/_content/sync/', {});
  }
}

export const ExecutionEnvironmentRemoteAPI = new API();
