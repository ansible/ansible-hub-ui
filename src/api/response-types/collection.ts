type SignState = 'signed' | 'unsigned' | 'partial';

export class CollectionUploadType {
  id: string;
  file: File;
  sha256: string;
}

export class CollectionVersion {
  id: string;
  version: string;
  metadata: {
    contents: ContentSummaryType[];
    description: string;
    tags: string[];
    dependencies: DependencyType[];
  };
  created_at: string;
  // contents: ContentSummaryType[]; // deprecated
  namespace: string;
  name: string;
  repository_list: string[];
  sign_state: SignState;
}

class RenderedFile {
  name: string;
  html: string;
}

export class CollectionVersionDetail extends CollectionVersion {
  metadata: {
    contents: ContentSummaryType[];
    description: string;
    tags: string[];
    authors: string[];
    license: string;
    homepage: string;
    documentation: string;
    issues: string;
    repository: string;
    dependencies: DependencyType[];
    signatures: {
      signature: string;
      pubkey_fingerprint: string;
      signing_service: string;
      pulp_created: string;
    }[];
  };
  sign_state: SignState;
  requires_ansible?: string;
  docs_blob: DocsBlobType;
}

export class CollectionListType {
  id: string;
  name: string;
  description: string;
  // download_count: number;
  deprecated: boolean;
  latest_version: CollectionVersion;
  sign_state: SignState;

  namespace: {
    id: number;
    description: string;
    name: string;
    avatar_url: string;
    company: string;
  };
  total_versions: number;
  signed_versions: number;
  unsigned_versions: number;
}

export class PluginContentType {
  content_type: string;
  content_name: string;
  readme_filename: string;
  readme_html: string;
  doc_strings: {
    doc: unknown;
    metadata: unknown;
    return: unknown;
    examples: string;
  };
}

class RoleContentType {
  content_type: string;
  content_name: string;
  readme_filename: string;
  readme_html: string;
}

class PlaybookContentType {
  // not supported yet
  content_type: string;
  content_name: string;
}

export class DocsBlobType {
  collection_readme: RenderedFile;
  documentation_files: RenderedFile[];
  contents: (PluginContentType | RoleContentType | PlaybookContentType)[];
}

export class ContentSummaryType {
  name: string;
  content_type: string;
  description: string;
}

export class CollectionExcludesType {
  collections: string[];
}

export class CollectionDetailType {
  deprecated: boolean;
  all_versions: {
    id: string;
    version: string;
    created: string;
    sign_state: SignState;
  }[];
  latest_version: CollectionVersionDetail;

  id: string;
  name: string;
  description: string;
  sign_state: SignState;
  total_versions: number;
  signed_versions: number;
  unsigned_versions: number;
  // download_count: number;

  namespace: {
    id: number;
    description: string;
    name: string;
    avatar_url: string;
    company: string;
    related_fields: { my_permissions?: string[] };
  };
}

export class CollectionUsedByDependencies extends CollectionDetailType {
  version: string;
  repository_list: string[];
}

export class DependencyType {
  [namespaceCollection: string]: string;
}
