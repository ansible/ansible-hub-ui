import { BaseAPI } from './base';

export class HubAPI extends BaseAPI {
  UI_API_VERSION = 'v1';

  apiPath: string;
  http: any;

  constructor() {
    super(API_HOST + API_BASE_PATH);
  }

  // Use this function to get paths in the _ui API. That will ensure the API version
  // gets updated when it changes
  getUIPath(url: string) {
    return `_ui/${this.UI_API_VERSION}/${url}`;
  }
}
