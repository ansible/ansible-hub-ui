export class AnsibleRepositoryType {
  description: string;
  latest_version_href?: string;
  name: string;
  pulp_created?: string;
  pulp_href?: string;
  pulp_labels?: { [key: string]: string };
  remote?: string;
  retain_repo_versions: number;
  private?: boolean;

  // gpgkey
  // last_synced_metadata_time
  // versions_href

  my_permissions?: string[];
}

type ContentSummary = { [key: string]: { count: number; href: string } };
export class AnsibleRepositoryVersionType {
  pulp_href: string;
  pulp_created: string;
  number: number;
  repository: string;
  base_version: null;
  content_summary: {
    added: ContentSummary;
    removed: ContentSummary;
    present: ContentSummary;
  };
}
