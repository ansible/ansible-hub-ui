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
  UI_API_VERSION = 'v3';
  apiPath = this.getUIPath('sign/collections/');

  constructor() {
    super(API_HOST + API_BASE_PATH);
  }

  getUIPath(url: string) {
    return `${this.UI_API_VERSION}/${url}`;
  }

  sign(data: SignProps) {
    return this.http.post(this.apiPath, data);
  }
}

export const SignCollectionAPI = new API();
