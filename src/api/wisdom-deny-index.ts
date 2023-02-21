import { HubAPI } from './hub';

export class API extends HubAPI {
  path = this.getUIPath('ai_deny_index/');

  isInList(scope, reference) {
    const params = { scope, reference };
    return super
      .list(params, this.path)
      .then((response) => (response.data.count > 0 ? true : false));
  }
}

export const wisdomDenyIndexAPI = new API();
