import { HubAPI } from './hub';

export class API extends HubAPI {
  path = this.getUIPath('ai_deny_index/');

  isInDenyIndex(scope, reference) {
    return this.http
      .get(this.path + `/?scope=${scope}&reference=${reference}`)
      .then((response) => {
        return response.data.count > 0 ? true : false;
      });
  }

  removeFromDenyIndex(scope, reference) {
    const removePath = this.path + scope + '/' + reference + '/';
    return this.http.delete(removePath);
  }

  addToDenyIndex(scope, reference) {
    const params = { reference };
    const addPath = this.path + scope + '/';
    return this.http.post(addPath, params);
  }
}

export const wisdomDenyIndexAPI = new API();
