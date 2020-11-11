import { PulpStatus } from './pulp';

class LastSyncType {
  state: PulpStatus;
  started_at: string;
  finished_at: string;
  error: {
    traceback: string;
    description: string;
  };
}

export class RemoteType {
  name: string;
  url: string;
  auth_url: string;
  token: string;
  policy: string;
  requirements_file: string;
  updated_at: string;
  created_at: string;
  username: string;
  password: string;
  proxy_url: string;
  tls_validation: boolean;
  client_key: string;
  client_cert: string;
  ca_cert: string;

  repositories: {
    name: string;
    description: string;
    last_sync_task: LastSyncType;
    distributions: {
      name: string;
      base_path: string;
    }[];
  }[];
  last_sync_task: LastSyncType;
}
