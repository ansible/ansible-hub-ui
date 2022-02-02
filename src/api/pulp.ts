import { BaseAPI } from './base';

export class PulpAPI extends BaseAPI {
  constructor() {
    // FIXME this will have a prefix, also update containers/task-management/task_detail.tsx
    super('/pulp/api/v3/');
  }
}
