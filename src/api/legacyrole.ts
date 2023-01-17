import axios from 'axios';
import { LegacyAPI } from './legacy';

export class API extends LegacyAPI {
  apiPath = this.getApiPath('');

  constructor() {
    super();
  }

  list(params?) {
    const path = this.apiPath + 'roles/';

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

export const LegacyRoleAPI = new API();
