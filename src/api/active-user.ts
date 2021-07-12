import { Constants } from 'src/constants';
import { HubAPI } from './hub';

class API extends HubAPI {
  apiPath = this.getUIPath('me/');

  constructor() {
    super();
  }

  getUser(): Promise<any> {
    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      return new Promise((resolve, reject) => {
        (window as any).insights.chrome.auth
          .getUser()
          // we don't care about entitlements stuff in the UI, so just
          // return the user's identity
          .then((result) => resolve(result.identity))
          .catch((result) => reject(result));
      });
    } else if (DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE) {
      return new Promise((resolve, reject) => {
        this.http
          .get(this.apiPath)
          .then((result) => {
            resolve(result.data);
          })
          .catch((result) => reject(result));
      });
    }
  }

  getActiveUser() {
    return this.http.get(this.apiPath);
  }

  saveUser(data) {
    return this.http.put(this.apiPath, data);
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
    return this.http.post('v3/auth/token/', {});
  }

  // Note: This does not reset the app's authentication state. That has to be done
  // separately by setting the user state in the app's root component
  logout() {
    return this.http.post(this.getUIPath('auth/logout/'), {});
  }

  // Note: This does not reset the app's authentication state. That has to be done
  // separately by setting the user state in the app's root component
  login(username, password) {
    const loginURL = this.getUIPath('auth/login/');

    return new Promise((resolve, reject) => {
      // Make a get request to the login endpoint to set CSRF tokens before making
      // the authentication reqest
      this.http
        .get(loginURL)
        .then(() => {
          this.http
            .post(loginURL, {
              username: username,
              password: password,
            })
            .then((response) => resolve(response))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}

export const ActiveUserAPI = new API();
