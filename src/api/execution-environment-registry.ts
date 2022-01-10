import { HubAPI } from './hub';
import { RemoteType } from '.';
import { smartUpdate } from './remotes';

class API extends HubAPI {
  apiPath = this.getUIPath('execution-environments/registries/');

  // list(params?)
  // create(data)
  // get(name)
  // delete(name)

  smartUpdate(pk, newValue: RemoteType, oldValue: RemoteType) {
    const reducedData = smartUpdate(newValue, oldValue);
    return super.update(pk, reducedData);
  }

  update(_id, _obj): Promise<never> {
    throw 'use smartUpdate()';
  }

  index(id) {
    return this.http.post(this.apiPath + id + '/index/', {});
  }

  sync(id) {
    return this.http.post(this.apiPath + id + '/sync/', {});
  }
}

export const ExecutionEnvironmentRegistryAPI = new API();
