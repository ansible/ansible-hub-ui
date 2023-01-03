import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'remotes/ansible/collection/';
  useOrdering = true;

  // list(params?)
}

export const AnsibleRemoteAPI = new API();
