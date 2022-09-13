import { PulpAPI } from './pulp';

class API extends PulpAPI {
  public getSigningService(serviceName: string) {
    return this.http.get(`/signing-services/?name=${serviceName}`);
  }

  public sign(
    containerId: string,
    pulp_type: string,
    signServicePath: string,
    base_path: string,
  ) {
    const postObj = { manifest_signing_service: signServicePath };
    if (pulp_type == 'container') {
      postObj['future_base_path'] = base_path;
    }

    return this.http.post(
      `/repositories/container/${pulp_type}/${containerId}/sign/`,
      postObj,
    );
  }
}

export const SignContainersAPI = new API();
