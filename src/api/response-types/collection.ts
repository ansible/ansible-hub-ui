type SignState = 'signed' | 'unsigned';

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
    license: string[];
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

export class CollectionVersionSearch {
  collection_version: {
    contents: ContentSummaryType[];
    dependencies: {
      [collection: string]: string;
    };
    description: string;
    name: string;
    namespace: string;
    pulp_created: string;
    pulp_href: string;
    require_ansible: string;
    tags: {
      name: string;
    }[];
    version: string;
  };
  is_deprecated: boolean;
  is_highest: boolean;
  is_signed: boolean;
  // TODO: ansible namespace metadata doesn't work yet
  // assuming fields from pulp_ansible/NamespaceSummarySerializer
  namespace_metadata?: {
    pulp_href: string;
    name: string;
    company: string;
    description: string;
    avatar_url: string;
  };
  repository: {
    description: string;
    latest_version_href: string;
    name: string;
    pulp_created: string;
    pulp_href: string;
    pulp_labels: {
      pipeline?: string;
    };
    remote?: string;
    retain_repo_versions: number;
    versions_href: string;
  };
  repository_version: string;
}

export class CollectionVersionContentType {
  contents: ContentSummaryType[];
  description: string;
  tags: string[];
  authors: string[];
  license: string[];
  homepage: string;
  documentation: string;
  issues: string;
  repository: string;
  dependencies: DependencyType[];
  docs_blob: DocsBlobType;
  requires_ansible: string;
}

export class CollectionListType {
  id: string;
  name: string;
  description: string;
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
}

export class PluginOption {
  name: string;
  description: string[];
  type: string;
  required: boolean;
  default?: string | number | boolean;
  aliases?: string[];
  suboptions?: PluginOption[];
}

export class PluginDoc {
  short_description: string;
  description: string[];
  options?: PluginOption[];
  requirements?: string[];
  notes?: string[];
  deprecated?: {
    removed_in?: string;
    alternative?: string;
    why?: string;
  };
}

export class ReturnedValue {
  name: string;
  description: string[];
  returned: string;
  type: string;
  // if string: display the value, if object or list return JSON
  sample: string | object;
  contains: ReturnedValue[];
}

export class PluginContentType {
  content_type: string;
  content_name: string;
  readme_filename: string;
  readme_html: string;
  doc_strings: {
    doc: PluginDoc;
    metadata: unknown;
    return: ReturnedValue[];
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
