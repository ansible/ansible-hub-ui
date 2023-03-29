import {
  AnsibleDistributionAPI,
  CollectionVersionSearch,
  findDistroBasePathByRepo,
} from 'src/api';
import { HubAPI } from './hub';

interface SignNamespace {
  signing_service?: string;
  repository: CollectionVersionSearch['repository'];
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

  async sign(data: SignProps) {
    const { repository, ...args } = data;
    const distros = await AnsibleDistributionAPI.list({
      repository: repository.pulp_href,
    });

    const distroBasePath = findDistroBasePathByRepo(
      distros.data.results,
      repository,
    );

    const updatedData = {
      distro_base_path: distroBasePath,
      ...args,
    };

    return this.http.post(this.apiPath, updatedData);
  }
}

export const SignCollectionAPI = new API();
