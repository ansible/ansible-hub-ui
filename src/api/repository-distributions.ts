import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = '/distributions/ansible/ansible/';

  queryDistributionsByRepositoryHrefs(repoHrefs: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = {
        page_size: '999',
      };

      if (repoHrefs.length > 0) {
        params['repository__in'] = repoHrefs.join(',');
      }

      super
        .list(params)
        .then((res) => {
          return resolve(res.data.results);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
}

export const RepositoryDistributions = new API();
