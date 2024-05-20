import { GatewayAPI } from './gateway';

class API extends GatewayAPI {
  logout() {
    return this.http.post('v1/logout/', {});
  }
}

export const GatewayLogoutAPI = new API();
