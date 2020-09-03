import { BaseAPI } from './base';
import { RemoteType } from '.';

class API extends BaseAPI {
  apiPath = this.getUIPath('remotes/');

  constructor() {
    super();
  }

  update(distribution, remote: RemoteType) {
    const reducedData = {};
    for (const field of [
      'url',
      'name',
      'auth_url',
      'token',
      'requirements_file',
    ]) {
      reducedData[field] = remote[field];
    }

    if (reducedData['requirements_file'] === '') {
      reducedData['requirements_file'] = null;
    }

    return this.http.put(
      `content/${distribution}/v3/sync/config/`,
      reducedData,
    );
  }

  sync(distribution) {
    return this.http.post(`content/${distribution}/v3/sync/`, {});
  }
}

export const RemoteAPI = new API();
