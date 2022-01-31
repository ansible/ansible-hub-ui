import { BaseAPI } from './base';

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

class API extends BaseAPI {
  apiPath = 'v3/sign/collections/';

  constructor() {
    super(API_HOST + API_BASE_PATH);
  }

  sign(data: SignProps) {
    return this.http.post(this.apiPath, data);
  }
}

export const SignCollectionAPI = new API();
