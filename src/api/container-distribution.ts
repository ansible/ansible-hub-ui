import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'distributions/container/container/';

  constructor() {
    super();
  }
}

export const ContainerDistributionAPI = new API();
