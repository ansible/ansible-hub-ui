import * as React from 'react';
import './table-of-contents.scss';

import { Link } from 'react-router-dom';

import { DocsBlobType } from '../../api';
import { Paths, formatPath } from '../../paths';

interface IProps {
    docs_blob: DocsBlobType;
    namespace: string;
    collection: string;
    selectedName?: string;
    selectedType?: string;
    className?: string;
}

class DocsEntry {
    display: string;
    url?: string;
    selected?: boolean;
}

export class TableOfContents extends React.Component<IProps> {
    render() {
        const {
            docs_blob,
            namespace,
            collection,
            className,
            selectedName,
            selectedType,
        } = this.props;

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
            selected: selectedType === 'docs' && !selectedName,
        });

        for (const file of docs_blob.documentation_files) {
            const url = file.filename.replace('.', '-');
            table.documentation.push({
                display: this.capitalize(
                    file.filename
                        .split('.')[0]
                        .split('_')
                        .join(' '),
                ),
                url: formatPath(Paths.collectionDocsPage, {
                    ...baseUrlParams,
                    // TODO: Find a better way to handle file extensions in urls
                    page: url,
                }),
                selected: selectedType === 'docs' && selectedName === url,
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
                {Object.keys(table).map(key =>
                    table[key].length === 0
                        ? null
                        : this.renderLinks(table[key], key),
                )}
            </div>
        );
    }

    private renderLinks(links, title) {
        return (
            <div key={title}>
                <small className='category-header'>{title}</small>
                <div className='toc-nav'>
                    <ul>
                        {links.map((link: DocsEntry, i) => (
                            <li
                                key={i}
                                className={
                                    (title !== 'documentation'
                                        ? 'truncated '
                                        : ' ') +
                                    (link.selected ? 'selected' : '')
                                }
                            >
                                <Link
                                    className={link.selected ? 'selected' : ''}
                                    to={link.url}
                                >
                                    {link.display}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    private capitalize(s: string) {
        return s.slice(0, 1).toUpperCase() + s.slice(1);
    }

    private getContentEntry(content, base) {
        return {
            display: content.content_name,
            url: formatPath(Paths.collectionContentDocs, {
                ...base,
                type: content.content_type,
                name: content.content_name,
            }),
            selected:
                this.props.selectedName === content.content_name &&
                this.props.selectedType === content.content_type,
        };
    }
}
