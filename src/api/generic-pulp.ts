import { PulpAPI } from './pulp';
import { parsePulpIDFromURL } from 'src/utilities';

export class API extends PulpAPI {
  apiPath = '';
  get(id: string, apiPath?: string) {
    return !!parsePulpIDFromURL(id)
      ? this.http.get(this.getPath(apiPath) + id)
      : this.http.list(this.getPath(apiPath));
  }
}
export const GenericPulpAPI = new API();
