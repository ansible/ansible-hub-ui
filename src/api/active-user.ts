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
      return super.list();
    }
  }

  isPartnerEngineer() {
    return this.http.get(this.apiPath);
  }
}

export const ActiveUserAPI = new API();
