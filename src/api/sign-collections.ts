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
  apiPath = 'v3/sign/collections/';

  sign(data: SignProps) {
    return this.http.post(this.apiPath, data);
  }
}

export const SignCollectionAPI = new API();
