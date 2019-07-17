export class Namespace {
    name: string;
    company: string;
    email: string;
    avatar_url: string;
    description: string;
    resources_page_src: string;
    resources_page_html: string;
    owners: any[];
    useful_links: NamespaceLink[];
}

export class NamespaceLink {
    name: string;
    url: string;
}
