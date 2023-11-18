import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = '_ui/v1/imports/collections/';

  get(id, path?) {
    // call this to generate more task messages
    // this.mock.updateImportDetail();
    return super.get(id, path);
  }
}

export const ImportAPI = new API();
