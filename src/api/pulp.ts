import { Constants } from '../constants';
import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  apiPath: string;
  http: any;

  constructor() {
    super();
    console.log(this.http);
  }

  apiBaseURL() {
    return '/pulp/api/v3/';
  }

  public mapPageToOffset(p) {
    // replace sort with ordering
    const params = { ...p };
    const sort = params['sort'];
    params['ordering'] = sort;
    delete params['sort'];

    const pageSize =
      parseInt(params['page_size']) || Constants.DEFAULT_PAGE_SIZE;
    const page = parseInt(params['page']) || 1;

    delete params['page'];
    delete params['page_size'];

    params['offset'] = page * pageSize - pageSize;
    params['limit'] = pageSize;

    return params;
  }
}
