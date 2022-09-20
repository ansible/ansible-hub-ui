import { PulpAPI } from './pulp';

export class SigningServiceType {
  name: string;
  pubkey_fingerprint: string;
  public_key: string;
  pulp_created: string;
  pulp_href: string;
  script: string;
}

export class API extends PulpAPI {
  apiPath = 'signing-services/';

  // list(params?)
}

export const SigningServiceAPI = new API();
