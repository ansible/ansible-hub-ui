import { LastSyncType } from './remote';

export class AnsibleRepositoryType {
  description: string;
  last_sync_task?: LastSyncType;
  latest_version_href?: string;
  name: string;
  private?: boolean;
  pulp_created?: string;
  pulp_href?: string;
  pulp_labels?: { [key: string]: string };
  remote?: string;
  retain_repo_versions: number;

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
