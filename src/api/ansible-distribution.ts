import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'distributions/ansible/ansible/';

  // list(params?)
  // delete(pk)
}

export const AnsibleDistributionAPI = new API();
