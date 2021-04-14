import { PulpAPI } from './pulp';

export class API extends PulpAPI {
  apiPath = 'distributions/container/container/';
}

export const ContainerDistributionAPI = new API();
