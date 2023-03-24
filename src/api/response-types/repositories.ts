export interface Repository {
  name: string;
  description: string;
  pulp_href: string;
  pulp_created: string;
  versions_href: string;
  pulp_labels: { pipeline?: string };
  latest_version_href: string;
}
