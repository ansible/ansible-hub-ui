// insights crashes when you give it a .md page.

export function sanitizeDocsUrls(url) {
    return url.replace('.md', '');
}
