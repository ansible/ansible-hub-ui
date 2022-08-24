import { HubAPI } from './hub';
import { PulpAPI } from './pulp';

class API extends PulpAPI {
  public getSigningService(serviceName: string) {
    return this.http.get(`/signing-services/?name=${serviceName}`);
  }

  public sign(containerId: string, pulp_type, signServicePath) {
    let postObj = { manifest_signing_service: signServicePath };
    if (pulp_type == 'container') {
      postObj['future_base_path'] = 'library/busybox';
    }

    return this.http.post(
      `/repositories/container/${pulp_type}/${containerId}/sign/`,
      postObj,
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
