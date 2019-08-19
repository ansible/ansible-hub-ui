export class NamespaceLink {
    name: string;
    url: string;
}

export class NamespaceListType {
    id: number;
    name: string;
    company: string;
    email: string;
    avatar_url: string;
    description: string;
    num_collections: number;
}

export class NamespaceType extends NamespaceListType {
    resources_page_src: string;
    resources_page_html: string;
    owners: any[];
    useful_links: NamespaceLink[];
}
