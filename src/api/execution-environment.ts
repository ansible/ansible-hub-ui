import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'repositories/container/container-push/';

  constructor() {
    super();
  }

  list(params?: object, apiPath?: string) {
    // Pulp specific: replace sort with ordering
    let modifiedParams = this.mapPageToOffset(params);
    modifiedParams['ordering'] = params['sort'];
    delete modifiedParams['sort'];

    return this.http
      .get(this.getPath(apiPath), {
        params: modifiedParams,
      })
      .then(results =>
        Promise.all(
          results.data.results.map(result =>
            this.http
              .get(result.latest_version_href.replace('/pulp/api/v3/', ''), {})
              .then(data => (result['last_modified'] = data.data.pulp_created)),
          ),
        ).then(() => results),
      );
  }
}

export const ExecutionEnvironmentAPI = new API();
