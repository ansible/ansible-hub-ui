import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = this.getUIPath('ai_deny_index/');

  isInDenyIndex(scope, reference) {
    return this.http
      .get(
        this.apiPath +
          `?scope=${encodeURIComponent(scope)}&reference=${encodeURIComponent(
            reference,
          )}`,
      )
      .then((response) => {
        return response.data.count > 0 ? true : false;
      });
  }

  removeFromDenyIndex(scope, reference) {
    const removePath =
      this.apiPath +
      encodeURIComponent(scope) +
      '/' +
      encodeURIComponent(reference) +
      '/';
    return this.http.delete(removePath);
  }

  addToDenyIndex(scope, reference) {
    const params = { reference };
    const addPath = this.apiPath + encodeURIComponent(scope) + '/';
    return this.http.post(addPath, params);
  }
}

export const wisdomDenyIndexAPI = new API();
