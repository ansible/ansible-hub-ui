export class AnsibleRepositoryType {
  description: string;
  name: string;
  pulp_created?: string;
  pulp_href?: string;
  pulp_labels?: { [key: string]: string };
  retain_repo_versions: number;
  remote?: string;

  // gpgkey
  // last_synced_metadata_time
  // latest_version_href
  // versions_href
}
