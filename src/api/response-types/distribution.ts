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
