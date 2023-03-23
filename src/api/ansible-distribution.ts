import { PulpAPI } from './pulp';

class API extends PulpAPI {
  apiPath = 'distributions/ansible/ansible/';
  useOrdering = true;

  // list(params?)
}

export const AnsibleDistributionAPI = new API();
