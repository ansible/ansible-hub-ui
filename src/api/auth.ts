import { UserAuthType } from '../api';
import { BaseAPI } from './base';
import { Constants } from '../constants';

class API extends BaseAPI {
  apiPath = 'v3/_ui/auth/';

  constructor() {
    super();
  }

  // insights has some asinine way of loading tokens that involves forcing the
  // page to refresh before loading the token that can't be done witha single
  // API request.
  getToken(): Promise<any> {
    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      return new Promise((resolve, reject) => {
        reject(
          'User window.chrome.insights.auth to get tokens for insights deployments',
        );
      });
    }
    return this.http.post(this.apiPath + 'token', {});
  }

  logout() {
    // call this to generate more task messages
    // this.mock.updateImportDetail();
    return this.http.post(this.apiPath + 'logout/', {});
  }

  login(username, password) {
    // call this to generate more task messages
    // this.mock.updateImportDetail();
    return this.http.post(this.apiPath + 'login/', {
      username: username,
      password: password,
    });
  }
}

export const AuthAPI = new API();
