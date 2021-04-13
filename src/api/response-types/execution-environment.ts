export class ExecutionEnvironmentType {
  created: string;
  name: string;
  description: string;
  updated: string;
  pulp: { distribution: { base_path: string } };
}

export class ContainerManifestType {
  pulp_id: string;
  pulp_created: string;
  digest: string;
  schema_version: Number;
  config_blob: {
    digest: string;
    media_type: string;
    data?: Object;
  };
  tags: string[];
  layers: { digest: string; size: number }[];
}

export class ContainerRepositoryType {
  id: string;
  name: string;
  pulp: {
    repository: {
      pulp_id: string;
      pulp_type: string;
      version: string;
      name: string;
      description: string;
      pulp_created: string;
      last_sync_task: string;
      pulp_labels: object;
    };
    distribution: {
      pulp_id: string;
      base_path: string;
      name: string;
      pulp_created: string;
      pulp_labels: object;
    };
  };
  namespace: {
    name: string;
    my_permissions: string[];
    owners: string[];
  };
  description: string;
  created: string;
  updated: string;
}
