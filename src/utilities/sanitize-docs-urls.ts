// TODO: insights crashes when you give it a .md page. Need to find
// a more elegant solution to this problem

export function sanitizeDocsUrls(url) {
    return url.replace('.md', '');
}
