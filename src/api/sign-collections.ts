import { repositoryBasePath } from 'src/utilities';
import { HubAPI } from './hub';
import { type CollectionVersionSearch } from './response-types/collection';

interface SignNamespace {
  signing_service?: string;
  repository?: CollectionVersionSearch['repository'];
  repository_name?: string;
  namespace: string;
}

interface SignCollection extends SignNamespace {
  collection?: string;
}

interface SignCollectionVersion extends SignCollection {
  version?: string;
}

type SignProps = SignNamespace | SignCollection | SignCollectionVersion;

class API extends HubAPI {
  apiPath = '_ui/v1/collection_signing/';

  async sign({ repository, repository_name: name, ...args }: SignProps) {
    const distroBasePath = await repositoryBasePath(
      name,
      repository?.pulp_href,
    ).catch((status) =>
      Promise.reject({
        response: { status },
      }),
    );

    const updatedData = {
      distro_base_path: distroBasePath,
      ...args,
    };

    return this.http.post(this.apiPath, updatedData);
  }
}

export const SignCollectionAPI = new API();
