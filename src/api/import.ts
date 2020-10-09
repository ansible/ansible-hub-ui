import { BaseAPI } from './base';

export class API extends BaseAPI {
  apiPath = this.getUIPath('imports/collections/');
  mock: any;

  constructor() {
    super();
  }

  get(id, path?) {
    // call this to generate more task messages
    // this.mock.updateImportDetail();
    return super.get(id, path);
  }
}

export const ImportAPI = new API();
