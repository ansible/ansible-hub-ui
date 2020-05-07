import { UserAuthType } from '../api';
import { BaseAPI } from './base';
import { Constants } from '../constants';

class API extends BaseAPI {
  apiPath = 'v3/_ui/me/';

  constructor() {
    super();
  }

  getUser(): Promise<UserAuthType> {
    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      return new Promise((resolve, reject) => {
        (window as any).insights.chrome.auth
          .getUser()
          // we don't care about entitlements stuff in the UI, so just
          // return the user's identity
          .then(result => resolve(result.identity))
          .catch(result => reject(result));
      });
    } else if (DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE) {
      return new Promise((resolve, reject) => {
        resolve({} as UserAuthType);
      });
    }
  }

  isPartnerEngineer() {
    return this.http.get(this.apiPath);
  }

  // insights has some asinine way of loading tokens that involves forcing the
  // page to refresh before loading the token that can't be done witha single
  // API request.
  getToken(): Promise<any> {
    if (DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE) {
      return new Promise((resolve, reject) => {
        resolve({ refresh_token: 'FAKE TEMPORARY TOKEN!!!!' });
      });
    }
  }

  login(username, password) {
    // call this to generate more task messages
    // this.mock.updateImportDetail();
    return this.http.post('auth/login/', {
      username: username,
      password: password,
    });
  }
}

export const ActiveUser = new API();
