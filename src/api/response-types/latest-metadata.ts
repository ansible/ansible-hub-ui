export class LinksType {
  url: string;
  name: string;
}

export class LatestMetadataType {
  pulp_href: string;
  name: string;
  company: string;
  email: string;
  description: string;
  resources: string;
  links: LinksType[];
  avatar_sha256: string | null;
  avatar_url: string | null;
  metadata_sha256: string;
  groups: string[];
  task: string | null;
}
