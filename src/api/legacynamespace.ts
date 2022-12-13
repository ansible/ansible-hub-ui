import { LegacyAPI } from './legacy';
import axios from 'axios';

export class API extends LegacyAPI {
  apiPath = this.getApiPath('');

  constructor() {
    super();
  }

  list(params?) {
    const path = this.apiPath + 'namespaces/';

    // clean null'ish params
    if (params !== undefined && params !== null) {
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === '') {
          delete params[key];
        }
      }
    }

    return super.list(params, path).then((response) => ({
      ...response,
      data: {
        ...response.data,
      },
    }));
  }

  getCancelToken() {
    return axios.CancelToken.source();
  }
}

export const LegacyNamespaceAPI = new API();
