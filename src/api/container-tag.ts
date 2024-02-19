import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'repositories/container/container-push/';

  tag(repositoryID: string, tag: string, digest: string) {
    return this.http.post(this.apiPath + `${repositoryID}/tag/`, {
      digest,
      tag,
    });
  }

  untag(repositoryID: string, tag: string) {
    return this.http.post(this.apiPath + `${repositoryID}/untag/`, {
      tag,
    });
  }
}

export const ContainerTagAPI = new API();
