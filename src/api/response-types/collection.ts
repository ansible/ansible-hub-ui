export class CollectionUploadType {
    id: number;
    file: File;
    sha256: string;
}

export class CollectionVersion {
    id: number;
    version: string;
    metadata: {
        tags: string[];
        description: string;
    };
    created: string;
    contents: ContentSummaryType[];
}

class RenderedFile {
    name: string;
    html: string;
}

export class CollectionVersionDetail {
    id: number;
    version: string;
    metadata: {
        tags: string[];
        authors: string[];
        license: string;
        description: string;
        homepage: string;
        documentation: string;
        issues: string;
        repository: string;
    };
    created: string;
    collection_readme: RenderedFile;
    documentation_files: RenderedFile[];
    contents: (PluginContentType | RoleContentType | PlaybookContentType)[];
}

export class CollectionListType {
    id: number;
    name: string;
    description: string;
    download_count: number;
    // deprecated: boolean;
    // community_score: number;
    // community_survey_count: number;
    latest_version: CollectionVersion;
    // content_match?: ContentSummary;

    namespace: {
        id: number;
        description: string;
        // active: boolean;
        name: string;
        avatar_url: string;
        // location: string;
        company: string;
        // email: string;
        // html_url: string;
        // is_vendor: boolean;
        // owners: number[];
    };
}

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
    all_versions: {
        id: number;
        version: string;
        created: string;
    }[];
    latest_version: {
        id: number;
        version: string;
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
        created: string;
        docs_blob: DocsBlobType;
        contents: ContentSummaryType[];
    };

    id: number;
    name: string;
    description: string;
    download_count: number;

    namespace: {
        id: number;
        description: string;
        name: string;
        avatar_url: string;
        company: string;
    };
}
