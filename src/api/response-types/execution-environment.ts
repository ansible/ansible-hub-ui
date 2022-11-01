import { LastSyncType } from './remote';

export class ExecutionEnvironmentType {
  created_at: string;
  name: string;
  description: string;
  updated_at: string;
  pulp: {
    distribution: { base_path: string };
    repository: { pulp_id: string; version: string };
  };
}

export class ContainerManifestType {
  pulp_id: string;
  created_at: string;
  digest: string;
  schema_version: number;
  config_blob: {
    digest: string;
    media_type: string;
    data?: unknown;
  };
  tags: string[];
  layers: { digest: string; size: number }[];
}

export class ContainerRepositoryType {
  id: string;
  name: string;
  pulp: {
    repository: {
      id: string;
      pulp_type: string;
      version: string;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
      last_sync_task: string;
      pulp_labels: object;
      remote?: {
        id: string;
        pulp_href: string;
        registry: string;
        upstream_name: string;
        include_tags: string[];
        exclude_tags: string[];
        last_sync_task: LastSyncType;
        created_at: string;
        updated_at: string;
      };
      sign_state: string;
    };
    distribution: {
      id: string;
      base_path: string;
      name: string;
      created_at: string;
      updated_at: string;
      pulp_labels: object;
    };
  };
  namespace: {
    id: string;
    pulp_href: string;
    name: string;
    my_permissions: string[];
    owners: string[];
    created_at: string;
    updated_at: string;
  };
  description: string;
  created_at: string;
  updated_at: string;
}
