import { HubAPI } from './hub';
import { PulpAPI } from './pulp';

class API extends PulpAPI {
  public getSigningService(serviceName: string) {
    return this.http.get(`/signing-services/?name=${serviceName}`);
  }

  public sign(containerId: string, signServicePath) {
    return this.http.post(
      `/repositories/container/container-push/${containerId}/sign/`,
      { manifest_signing_service: signServicePath },
    );
  }

  public getRepository(repoName: string) {
    return this.http.get(
      `/repositories/container/container-push/?name=${repoName}`,
    );
  }
}

export const SignContainersAPI = new API();
