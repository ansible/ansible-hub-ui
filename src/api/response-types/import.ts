import { PulpStatus } from './pulp';

export enum ImportMessageCodes {
  error = 'error',
  failed = 'failed',
  warning = 'warning',
  success = 'success',
}

export class ImportListType {
  id: number;
  state: PulpStatus;
  started_at: string;
  finished_at: string;
  namespace: string;
  // Collection name
  name: string;
  version: string;
  collectionRepo: string;
}

export class ImportDetailType extends ImportListType {
  error?: {
    code: string;
    description: string;
    traceback: string;
  };

  job_id: string;
  imported_version: string;
  messages: {
    level: string;
    message: string;
    time: string;
  }[];
}
