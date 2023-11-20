import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  // base get adds a trailing slash
  get(url: string) {
    return this.http.get(url);
  }
}

export const GenericPulpAPI = new API();
