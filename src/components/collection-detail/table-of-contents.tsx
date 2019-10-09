import * as React from 'react';
import './table-of-contents.scss';

import { Link } from 'react-router-dom';
import { CaretDownIcon, CaretLeftIcon } from '@patternfly/react-icons';

import { DocsBlobType } from '../../api';
import { Paths, formatPath } from '../../paths';
import { ParamHelper, sanitizeDocsUrls } from '../../utilities';

class DocsEntry {
    display: string;
    name: string;
    type: string;
    url?: string;
}

interface IState {
    table: {
        documentation: DocsEntry[];
        modules: DocsEntry[];
        roles: DocsEntry[];
        plugins: DocsEntry[];
        playbooks: DocsEntry[];
    };

    collapsedCategories: string[];
}

interface IProps {
    docs_blob: DocsBlobType;
    namespace: string;
    collection: string;
    params: object;
    selectedName?: string;
    selectedType?: string;
    className?: string;
}

export class TableOfContents extends React.Component<IProps, IState> {
    // There's a lot of heavy processing that goes into formatting the table
    // variable. To prevent running everything each time the component renders,
    // we're moving the table variable into state and building it once when the
    // component is loaded.
    constructor(props) {
        super(props);

        const { docs_blob, namespace, collection } = this.props;

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
            type: 'docs',
            name: 'readme',
        });

        if (docs_blob.documentation_files) {
            for (const file of docs_blob.documentation_files) {
                const url = sanitizeDocsUrls(file.name);
                table.documentation.push({
                    display: this.capitalize(
                        file.name
                            .split('.')[0]
                            .split('_')
                            .join(' '),
                    ),
                    url: formatPath(Paths.collectionDocsPage, {
                        ...baseUrlParams,
                        page: url,
                    }),
                    // selected: selectedType === 'docs' && selectedName === url,
                    type: 'docs',
                    name: url,
                });
            }
        }

        if (docs_blob.contents) {
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
        }

        // Sort docs
        for (const k of Object.keys(table)) {
            table[k].sort((a, b) => (a.display > b.display ? 1 : -1));
        }

        this.state = { table: table, collapsedCategories: [] };
    }

    render() {
        const { className } = this.props;
        const { table } = this.state;

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

    private toggleHeader(title) {
        const i = this.state.collapsedCategories.findIndex(x => x === title);

        if (i > -1) {
            const newCollapsed = [...this.state.collapsedCategories];
            newCollapsed.splice(i, 1);

            this.setState({
                collapsedCategories: newCollapsed,
            });
        } else {
            this.setState({
                collapsedCategories: this.state.collapsedCategories.concat([
                    title,
                ]),
            });
        }
    }

    private renderLinks(links, title) {
        if (this.state.collapsedCategories.includes(title)) {
            return (
                <div key={title}>
                    <small
                        className='category-header clickable'
                        onClick={() => this.toggleHeader(title)}
                    >
                        {title} ({links.length}) <CaretLeftIcon />
                    </small>
                </div>
            );
        }

        return (
            <div key={title}>
                <small
                    className='category-header clickable'
                    onClick={() => this.toggleHeader(title)}
                >
                    {title} ({links.length}) <CaretDownIcon />
                </small>
                <div className='toc-nav'>
                    <ul>
                        {links.map((link: DocsEntry, i) => (
                            <li
                                key={i}
                                className={
                                    (title !== 'documentation'
                                        ? 'truncated '
                                        : ' ') +
                                    (this.isSelected(link) ? 'selected' : '')
                                }
                            >
                                <Link
                                    className={
                                        this.isSelected(link) ? 'selected' : ''
                                    }
                                    to={
                                        link.url +
                                        (Object.keys(this.props.params)
                                            .length != 0
                                            ? '?' +
                                              ParamHelper.getQueryString(
                                                  this.props.params,
                                              )
                                            : '')
                                    }
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

    private isSelected(entry: DocsEntry): boolean {
        // the readme's url is always docs/, so load it when the name is null
        if (!this.props.selectedName && entry.name === 'readme') {
            return true;
        }

        return (
            // selected name and type are the values found for type and name
            // in the page url
            this.props.selectedName === entry.name &&
            this.props.selectedType === entry.type
        );
    }

    private capitalize(s: string) {
        return s.slice(0, 1).toUpperCase() + s.slice(1);
    }

    private getContentEntry(content, base): DocsEntry {
        return {
            display: content.content_name,
            url: formatPath(Paths.collectionContentDocs, {
                ...base,
                type: content.content_type,
                name: content.content_name,
            }),
            name: content.content_name,
            type: content.content_type,
        };
    }
}
