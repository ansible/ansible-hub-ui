import { HubAPI } from './hub';

export class API extends HubAPI {
  apiPath = 'v3/tasks/';
}

export const TaskAPI = new API();
