import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'repositories/container/container-push/';

  tag(repositoryID: string, tag: string, digest: string) {
    return this.http.post(`${this.apiPath}${repositoryID}/tag/`, {
      digest: digest,
      tag: tag,
    });
  }

  untag(repositoryID: string, tag: string, digest: string) {
    return this.http.post(`${this.apiPath}${repositoryID}/untag/`, {
      digest: digest,
      tag: tag,
    });
  }
}

export const ContainerTagAPI = new API();
