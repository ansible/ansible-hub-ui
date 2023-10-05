import { LegacyAPI } from './legacy';

export class API extends LegacyAPI {
  apiPath = 'v1/namespaces/';
  sortParam = 'sort';

  // get(id)
  // list(params?)
}

export const LegacyNamespaceAPI = new API();
