export interface Repository {
  name: string;
  pulp_href: string;
  pulp_created: string;
  versions_href: string;
  pulp_labels: { pipeline?: string };
}
