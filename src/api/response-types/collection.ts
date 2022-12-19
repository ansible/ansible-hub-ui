export class CollectionUploadType {
  id: string;
  file: File;
  sha256: string;
}

export class CollectionVersion {
  id: string;
  version: string;
  metadata: {
    tags: string[];
    description: string;
  };
  created_at: string;
  contents: ContentSummaryType[];
  namespace: string;
  name: string;
  repository_list: string[];
}

class RenderedFile {
  name: string;
  html: string;
}

export class CollectionVersionDetail extends CollectionVersion {
  metadata: {
    description: string;
    tags: string[];
    authors: string[];
    license: string;
    homepage: string;
    documentation: string;
    issues: string;
    repository: string;
  };
  docs_blob: DocsBlobType;
}

export class CollectionListType {
  id: string;
  name: string;
  description: string;
  // download_count: number;
  deprecated: boolean;
  latest_version: CollectionVersion;

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
  }[];
  latest_version: CollectionVersionDetail;

  id: string;
  name: string;
  description: string;
  // download_count: number;

  namespace: {
    id: number;
    description: string;
    name: string;
    avatar_url: string;
    company: string;
  };
}
