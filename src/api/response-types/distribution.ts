export class DistributionType {
  pulp_id: string;
  name: string;
  base_path: string;
  repository: {
    pulp_id: string;
    name: string;
    description: string;
    pulp_last_updated: string;
    content_count: number;
  };
}

export class PulpAnsibleDistributionType {
  base_path: string;
  client_url: string;
  content_guard: string;
  name: string;
  pulp_created: string;
  pulp_href: string;
  pulp_labels: object;
  repository: string;
  repository_version: string;
}
