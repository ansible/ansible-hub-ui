export class PluginContentType {
  content_type: string;
  content_name: string;
  readme_filename: string;
  readme_html: string;
  doc_strings: {
    doc: any;
    metadata: any;
    return: any;
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

class RenderedFile {
  name: string;
  html: string;
}

export class DocsBlobType {
  collection_readme: RenderedFile;
  documentation_files: RenderedFile[];
  contents: (PluginContentType | RoleContentType | PlaybookContentType)[];
}
