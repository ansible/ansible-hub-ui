import { HubAPI } from './hub';

interface SignNamespace {
  signing_service?: string;
  repository?: string;
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
  apiPath = '_ui/v1/collection_signing/';

  sign(data: SignProps) {
    const { repository: distro_base_path, ...rest } = data;
    return this.http.post(this.apiPath, {
      ...rest,
      distro_base_path,
    });
  }
}

export const SignCollectionAPI = new API();
