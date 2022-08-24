import { HubAPI } from './hub';
import { PulpAPI } from './pulp';

class API extends PulpAPI {
  public getSigningService(serviceName: string) {
    return this.http.get(`/signing-services/?name=${serviceName}`);
  }

  public sign(containerId: string, pulp_type, signServicePath) {
    return this.http.post(
      `/repositories/container/${pulp_type}/${containerId}/sign/`,
      { manifest_signing_service: signServicePath },
    );
  }

  /*public getRepository(repoName: string) {
    return this.http.get(
      `/repositories/container/container-push/?name=${repoName}`,
    );
  }*/

  public getSignature(containerId, version, pulp_type) {
    return this.http.get(
      `/repositories/container/${pulp_type}/${containerId}/versions/${version}`,
    );
  }
}

export const SignContainersAPI = new API();
