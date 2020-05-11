import { UserAuthType } from '../api';
import { BaseAPI } from './base';
import { Constants } from '../constants';

class API extends BaseAPI {
  apiPath = 'v3/_ui/me/';

  private userCache: any;

  constructor() {
    super();
  }

  getUser(forceRefresh = false): Promise<any> {
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
        if (this.userCache && !forceRefresh) {
          resolve(this.userCache);
        }
        super
          .list()
          .then(result => {
            this.userCache = result.data;
            resolve(result.data);
          })
          .catch(result => reject(result));
      });
    }
  }

  // insights has some asinine way of loading tokens that involves forcing the
  // page to refresh before loading the token that can't be done witha single
  // API request.
  getToken(): Promise<any> {
    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      return new Promise((resolve, reject) => {
        reject(
          'Use window.chrome.insights.auth to get tokens for insights deployments',
        );
      });
    }
    return this.http.post('v3/_ui/auth/token/', {});
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.http
        .post('v3/_ui/auth/logout/', {})
        .then(result => {
          this.userCache = undefined;
          resolve(result);
        })
        .catch(result => result);
    });
  }

  login(username, password) {
    return this.http.post('v3/_ui/auth/login/', {
      username: username,
      password: password,
    });
  }

  isPartnerEngineer() {
    return this.http.get(this.apiPath);
  }
}

export const ActiveUserAPI = new API();
