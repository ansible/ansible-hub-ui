import { t } from '@lingui/macro';
import {
  AnsibleDistributionAPI,
  AnsibleRepositoryAPI,
  CollectionVersionSearch,
} from 'src/api';
import { HubAPI } from './hub';

interface SignNamespace {
  signing_service?: string;
  repository?: CollectionVersionSearch['repository'];
  repository_name?: string;
  namespace: string;
}

interface SignCollection extends SignNamespace {
  collection?: string;
}

interface SignVersion extends SignCollection {
  version?: string;
}

type SignProps = SignNamespace | SignCollection | SignVersion;

class API extends HubAPI {
  apiPath = this.getUIPath('collection_signing/');

  async sign({ repository, repository_name: name, ...args }: SignProps) {
    if (!repository && name) {
      repository = (await AnsibleRepositoryAPI.list({ name }))?.data
        ?.results?.[0];

      if (!repository) {
        return Promise.reject({
          response: { status: t`Failed to find repository ${name}` },
        });
      }
    }

    const distribution = (
      await AnsibleDistributionAPI.list({
        repository: repository?.pulp_href,
      })
    )?.data?.results?.[0];

    if (!distribution) {
      const name = repository.name;
      return Promise.reject({
        response: {
          status: t`Failed to find a distribution for repository ${name}`,
        },
      });
    }

    const updatedData = {
      distro_base_path: distribution.base_path,
      ...args,
    };

    return this.http.post(this.apiPath, updatedData);
  }
}

export const SignCollectionAPI = new API();
