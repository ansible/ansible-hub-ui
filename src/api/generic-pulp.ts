import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = '';
  get(id: string, apiPath?: string) {
    return this.http.get(this.getPath(apiPath) + id);
  }
}
export const GenericPulpAPI = new API();
