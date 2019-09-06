import * as React from 'react';
import './table-of-contents.scss';

import { Link } from 'react-router-dom';

import { DocsBlobType } from '../../api';
import { Paths, formatPath } from '../../paths';

interface IProps {
    docs_blob: DocsBlobType;
    namespace: string;
    collection: string;
    className?: string;
}

class DocsEntry {
    display: string;
    url?: string;
}

export class TableOfContents extends React.Component<IProps> {
    render() {
        const { docs_blob, namespace, collection, className } = this.props;

        const baseUrlParams = {
            namespace: namespace,
            collection: collection,
        };

        const table = {
            documentation: [] as DocsEntry[],
            modules: [] as DocsEntry[],
            roles: [] as DocsEntry[],
            plugins: [] as DocsEntry[],
            playbooks: [] as DocsEntry[],
        };

        table.documentation.push({
            display: 'Readme',
            url: formatPath(Paths.collectionDocsIndex, baseUrlParams),
        });

        for (const file of docs_blob.documentation_files) {
            table.documentation.push({
                display: file.filename.split('.')[0].replace('_', ' '),
                url: formatPath(Paths.collectionDocsPage, {
                    ...baseUrlParams,
                    page: file.filename.replace('.', '-'),
                }),
            });
        }

        for (const content of docs_blob.contents) {
            switch (content.content_type) {
                case 'role':
                    table.roles.push(
                        this.getContentEntry(content, baseUrlParams),
                    );
                    break;
                case 'module':
                    table.modules.push(
                        this.getContentEntry(content, baseUrlParams),
                    );
                    break;
                case 'playbook':
                    table.playbooks.push(
                        this.getContentEntry(content, baseUrlParams),
                    );
                    break;
                default:
                    table.plugins.push(
                        this.getContentEntry(content, baseUrlParams),
                    );
                    break;
            }
        }

        return (
            <div className={'pf-c-content toc-body ' + className}>
                <ul>
                    {Object.keys(table).map(key =>
                        table[key].length === 0
                            ? null
                            : this.renderLinks(table[key], key),
                    )}
                </ul>
            </div>
        );
    }

    renderLinks(links, title) {
        return (
            <li key={title}>
                {title}
                <ul>
                    {links.map(link => (
                        <li key={link.url}>
                            <Link to={link.url}>{link.display}</Link>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }

    getContentEntry(content, base) {
        return {
            display: content.content_name,
            url: formatPath(Paths.collectionContentDocs, {
                ...base,
                type: content.content_type,
                name: content.content_name,
            }),
        };
    }
}
