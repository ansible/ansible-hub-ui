import { HubAPI } from './hub';
import { UserType } from './response-types/user';

class API extends HubAPI {
  apiPath = this.getUIPath('me/');

  constructor() {
    super();
  }

  getUser(): Promise<UserType> {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiPath)
        .then((result) => {
          resolve(result.data);
        })
        .catch((result) => reject(result));
    });
  }

  getActiveUser() {
    return this.http.get(this.apiPath);
  }

  saveUser(data) {
    return this.http.put(this.apiPath, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getToken(): Promise<any> {
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
