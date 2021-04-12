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
