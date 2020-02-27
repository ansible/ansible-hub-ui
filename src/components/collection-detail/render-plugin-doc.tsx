import * as React from 'react';
import './render-plugin-doc.scss';

import { Alert } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import { PluginContentType, ContentSummaryType } from '../../api';
import { Paths, formatPath } from '../../paths';
import { sanitizeDocsUrls } from '../../utilities';

interface IProps {
    plugin: PluginContentType;
    allContent: ContentSummaryType[];
    collectionName: string;
    namespaceName: string;
    params: {
        version?: string;
    };
}

class PluginOption {
    name: string;
    description: string[];
    type: string;
    required: boolean;
    default?: string | number | boolean;
    aliases?: string[];
    suboptions?: PluginOption[];
}

class PluginDoc {
    short_description: string;
    description: string[];
    options?: PluginOption[];
    requirements?: string[];
    notes?: string[];
    deprecated?: {
        removed_in?: string;
        alternate?: string;
        why?: string;
    };
}

class ReturnedValue {
    name: string;
    description: string[];
    returned: string;
    type: string;
    // if string: display the value, if object or list return JSON
    sample: any;
    contains: ReturnedValue[];
}

// Documentation for module doc string spec
// https://docs.ansible.com/ansible/latest/dev_guide/developing_modules_documenting.html

interface IState {
    renderError: boolean;
}

export class RenderPluginDoc extends React.Component<IProps, IState> {
    // checks if I(), B(), M(), U(), L(), or C() exists. Returns type (ex: B)
    // and value in parenthesis. Based off of formatters in ansible:
    // https://github.com/ansible/ansible/blob/devel/hacking/build_library/build_ansible/jinja2/filters.py#L26
    CUSTOM_FORMATTERS = /([IBMULC])\(([^)]+)\)/gm;
    subOptionsMaxDepth: number;
    returnContainMaxDepth: number;

    constructor(props) {
        super(props);
        this.state = {
            renderError: false,
        };
    }

    componentDidCatch(error, info) {
        console.log(error);
        this.setState({ renderError: true });
    }

    render() {
        const { plugin } = this.props;

        if (!this.state.renderError) {
            // componentDidCatch doesn't seem to be able to catch errors that
            // are thrown outside of return(), so we'll wrap everything in a
            // try just in case
            let doc: PluginDoc;
            let example: string;
            let returnVals: ReturnedValue[];
            let content: any;
            try {
                doc = this.parseDocString(plugin);
                example = this.parseExamples(plugin);
                returnVals = this.parseReturn(plugin);
                content = {
                    synopsis: this.renderSynopsis(doc),
                    parameters: this.renderParameters(
                        doc.options,
                        plugin.content_type,
                        this.subOptionsMaxDepth,
                    ),
                    notes: this.renderNotes(doc),
                    examples: this.renderExample(example),
                    returnValues: this.renderReturnValues(
                        returnVals,
                        this.returnContainMaxDepth,
                    ),
                    shortDescription: this.renderShortDescription(doc),
                    deprecated: this.renderDeprecated(doc, plugin.content_name),
                    requirements: this.renderRequirements(doc),
                };
            } catch (err) {
                console.log(err);
                return this.renderError(plugin);
            }

            return (
                <div className='pf-c-content'>
                    <h1>
                        {plugin.content_type} > {plugin.content_name}
                    </h1>
                    <br />
                    {content.shortDescription}
                    {content.deprecated}
                    {this.renderTableOfContents(content)}
                    {content.synopsis}
                    {content.requirements}
                    {content.parameters}
                    {content.notes}
                    {content.examples}
                    {content.returnValues}
                </div>
            );
        } else {
            return this.renderError(plugin);
        }
    }

    private renderError(plugin) {
        // There's a good chance that something about the plugin doc data will
        // be malformed since it isn't validated. When that hapens, show an
        // error instead of crashing the whole app
        return (
            <React.Fragment>
                <Alert
                    isInline
                    variant='warning'
                    title='Documentation Syntax Error: cannot parse plugin documention.'
                />
                <br />
                <div className='pf-c-content'>
                    {plugin.content_type && plugin.content_name ? (
                        <h1>
                            {plugin.content_type} > {plugin.content_name}
                        </h1>
                    ) : null}
                    <p>
                        The documentation object for this plugin seems to
                        contain invalid syntax that makes it impossible for
                        Automation Hub to parse. You can still look at the
                        unformatted documentation object bellow if you need to.
                    </p>

                    <h2>Unformatted Documentation</h2>

                    <pre className='plugin-raw'>
                        {JSON.stringify(plugin, null, 2)}
                    </pre>
                </div>
            </React.Fragment>
        );
    }

    private parseDocString(plugin: PluginContentType): PluginDoc {
        // TODO: if the parser can't figure out what to do with the object
        // passed to it, it should throw an error that can be displayed to the
        // user with the piece of the documention that's broken.

        // TODO: make the doc string match the desired output as closely as
        // possible
        if (!plugin.doc_strings) {
            return { description: [], short_description: '' } as PluginDoc;
        }

        const doc: PluginDoc = { ...plugin.doc_strings.doc };

        let maxDepth = 0;

        const parseOptions = (options: PluginOption[], depth) => {
            if (depth > maxDepth) {
                maxDepth = depth;
            }
            for (let op of options) {
                // Description is expected to be an array of strings. If its not,
                // do what we can to make it one
                op.description = this.ensureListofStrings(op.description);

                if (typeof op.default === 'object') {
                    op.default = JSON.stringify(op.default);
                }

                // recursively parse sub options
                if (op.suboptions) {
                    parseOptions(op.suboptions, depth + 1);
                }
            }
        };

        if (doc.options) {
            parseOptions(doc.options, 0);
        }

        doc.description = this.ensureListofStrings(doc.description);
        this.subOptionsMaxDepth = maxDepth;

        return doc;
    }

    private parseExamples(plugin: PluginContentType): string {
        if (!plugin.doc_strings) {
            return null;
        }

        if (typeof plugin.doc_strings.examples === 'string') {
            // the examples always seem to have an annoying new line at the top
            // so just replace it here if it exists.
            return plugin.doc_strings.examples.replace('\n', '');
        } else {
            return null;
        }
    }

    private parseReturn(plugin: PluginContentType): ReturnedValue[] {
        // TODO: make the return string match the desired output as closely as
        // possible

        if (!plugin.doc_strings) {
            return null;
        }

        if (!plugin.doc_strings.return) {
            return null;
        }

        let maxDepth = 0;

        const parseReturnRecursive = (returnV: ReturnedValue[], depth) => {
            if (depth > maxDepth) {
                maxDepth = depth;
            }
            for (let ret of returnV) {
                // Description is expected to be an array of strings. If its not,
                // do what we can to make it one
                ret.description = this.ensureListofStrings(ret.description);

                // recursively parse sub options
                if (ret.contains) {
                    parseReturnRecursive(ret.contains, depth + 1);
                }
            }
        };

        const returnValues = [...plugin.doc_strings.return];
        parseReturnRecursive(returnValues, 0);
        this.returnContainMaxDepth = maxDepth;

        return returnValues;
    }

    // This functions similar to how string.replace() works, except it returns
    // a react object instead of a string
    private reactReplace(
        text: string,
        reg: RegExp,
        replacement: (matches: string[]) => React.ReactNode,
    ): React.ReactNode {
        const fragments = [];

        let match: string[];
        let prevIndex = 0;
        while ((match = reg.exec(text)) !== null) {
            fragments.push(
                text.substr(
                    prevIndex,
                    reg.lastIndex - prevIndex - match[0].length,
                ),
            );
            fragments.push(replacement(match));
            prevIndex = reg.lastIndex;
        }

        if (fragments.length === 0) {
            return <span>{text}</span>;
        }

        // append any text after the last match
        if (prevIndex != text.length - 1) {
            fragments.push(text.substring(prevIndex));
        }

        return (
            <span>
                {fragments.map((x, i) => (
                    <React.Fragment key={i}>{x}</React.Fragment>
                ))}
            </span>
        );
    }

    private applyDocFormatters(text: string): React.ReactNode {
        const {
            collectionName,
            namespaceName,
            allContent,
            params,
        } = this.props;

        const nstring = this.reactReplace(
            text,
            this.CUSTOM_FORMATTERS,
            match => {
                const fullMatch = match[0];
                const type = match[1];
                const textMatch = match[2];

                switch (type) {
                    case 'L':
                        const url = textMatch.split(',');

                        if (url[1].startsWith('http')) {
                            return (
                                <a href={url[1]} target='_blank'>
                                    {url[0]}
                                </a>
                            );
                        } else {
                            // TODO: right now this will break if people put
                            // ../ at the front of their urls. Need to find a
                            // way to document this
                            return (
                                <Link
                                    to={formatPath(
                                        Paths.collectionDocsPage,
                                        {
                                            namespace: namespaceName,
                                            collection: collectionName,
                                            page: sanitizeDocsUrls(url[1]),
                                        },
                                        params,
                                    )}
                                >
                                    {url[0]}
                                </Link>
                            );
                        }
                    case 'U':
                        return (
                            <a href={textMatch} target='_blank'>
                                {textMatch}
                            </a>
                        );
                    case 'I':
                        return <i>{textMatch}</i>;
                    case 'C':
                        return <span className='inline-code'>{textMatch}</span>;
                    case 'M':
                        const module = allContent.find(
                            x =>
                                x.content_type === 'module' &&
                                x.name === textMatch,
                        );

                        if (module) {
                            return (
                                <Link
                                    to={formatPath(
                                        Paths.collectionContentDocs,
                                        {
                                            namespace: namespaceName,
                                            collection: collectionName,
                                            type: module.content_type,
                                            name: module.name,
                                        },
                                        params,
                                    )}
                                >
                                    {textMatch}
                                </Link>
                            );
                        } else {
                            return textMatch;
                        }
                    case 'B':
                        return <b>{textMatch}</b>;

                    default:
                        return fullMatch;
                }
            },
        );

        return nstring;
    }

    private ensureListofStrings(v) {
        if (typeof v === 'string') {
            return [v];
        } else if (!v) {
            return [];
        } else {
            return v;
        }
    }

    private renderDeprecated(doc: PluginDoc, pluginName: string) {
        const isDeprecated = doc.deprecated || pluginName.startsWith('_');

        if (!isDeprecated) {
            return null;
        }

        const deprecated = doc.deprecated || {};

        return (
            <React.Fragment>
                <h2>DEPRECATED</h2>
                {deprecated.removed_in ? (
                    <div>
                        <b>Removed in version</b> {doc.deprecated.removed_in}
                    </div>
                ) : null}

                <div>
                    <b>Why: </b>
                    {deprecated.why
                        ? doc.deprecated.why
                        : 'No reason specified.'}
                </div>

                <div>
                    <b>Alternative: </b>
                    {deprecated.why
                        ? doc.deprecated.why
                        : 'No alternatives specified.'}
                </div>
            </React.Fragment>
        );
    }

    private renderTableOfContents(content: any) {
        return (
            <ul>
                {content['synopsis'] !== null && (
                    <li>
                        <HashLink to='#synopsis'>Synopsis</HashLink>
                    </li>
                )}
                {content['parameters'] !== null && (
                    <li>
                        <HashLink to='#parameters'>Parameters</HashLink>
                    </li>
                )}
                {content['notes'] !== null && (
                    <li>
                        <HashLink to='#notes'>Notes</HashLink>
                    </li>
                )}
                {content['examples'] !== null && (
                    <li>
                        <HashLink to='#examples'>Examples</HashLink>
                    </li>
                )}
                {content['returnValues'] !== null && (
                    <li>
                        <HashLink to='#return-values'>Return Values</HashLink>
                    </li>
                )}
            </ul>
        );
    }

    private renderShortDescription(doc: PluginDoc) {
        return <div>{doc.short_description}</div>;
    }

    private renderSynopsis(doc: PluginDoc) {
        return (
            <React.Fragment>
                <h2 id='synopsis'>Synopsis</h2>
                <ul>
                    {doc.description.map((d, i) => (
                        <li key={i}>{this.applyDocFormatters(d)}</li>
                    ))}
                </ul>
            </React.Fragment>
        );
    }

    private renderParameters(
        parameters: PluginOption[],
        content_type: string,
        maxDepth: number,
    ) {
        if (!parameters) {
            return null;
        }

        // render the entries first,
        const paramEntries = this.renderParameterEntries(
            parameters,
            content_type,
            0,
            maxDepth,
            '',
        );

        return (
            <React.Fragment>
                <h2 id='parameters'>Parameters</h2>
                <table className='options-table'>
                    <tbody>
                        <tr>
                            <th colSpan={maxDepth + 1}>Parameter</th>
                            <th>
                                Choices/<span className='blue'>Defaults</span>
                            </th>
                            {content_type !== 'module' ? (
                                <th>Configuration</th>
                            ) : null}
                            <th>Comments</th>
                        </tr>
                        {paramEntries}
                    </tbody>
                </table>
            </React.Fragment>
        );
    }

    private renderParameterEntries(
        parameters: PluginOption[],
        content_type: string,
        depth: number,
        maxDepth: number,
        parent: string,
    ) {
        let output = [];
        parameters.forEach((option, i) => {
            const spacers = [];
            const key = `${parent}-${option.name}`;
            for (let x = 0; x < depth; x++) {
                spacers.push(<td key={x} className='spacer' />);
            }
            output.push(
                <tr key={key}>
                    {
                        // PARAMETER --------------------------------
                    }
                    {spacers}
                    <td
                        colSpan={maxDepth + 1 - depth}
                        className={option.suboptions ? 'parent' : ''}
                    >
                        <span className='option-name'>{option.name}</span>
                        <small>
                            {this.documentedType(option['type'])}
                            {option['elements'] ? (
                                <span>
                                    {' '}
                                    / elements =
                                    {this.documentedType(option['elements'])}
                                </span>
                            ) : null}
                            {option['required'] ? (
                                <span>
                                    {' '}
                                    / <span className='red'>required</span>
                                </span>
                            ) : null}
                        </small>
                    </td>
                    {
                        // CHOICES -------------------------------
                    }
                    <td>{this.renderChoices(option)}</td>
                    {
                        // CONFIGURATION (non module only) -------
                    }
                    {content_type !== 'module' ? (
                        <td>{this.renderPluginConfiguration(option)}</td>
                    ) : null}
                    {
                        // COMMENTS ------------------------------
                    }
                    <td>
                        {option.description.map((d, i) => (
                            <p key={i}>{this.applyDocFormatters(d)}</p>
                        ))}

                        {option['aliases'] ? (
                            <small>
                                <span className='green'>
                                    aliases: {option['aliases'].join(', ')}
                                </span>
                            </small>
                        ) : null}
                    </td>
                </tr>,
            );

            // recursively render sub options
            if (option.suboptions) {
                output = output.concat(
                    this.renderParameterEntries(
                        option.suboptions,
                        content_type,
                        depth + 1,
                        maxDepth,
                        key,
                    ),
                );
            }
        });

        return output;
    }

    private renderPluginConfiguration(option) {
        return (
            <React.Fragment>
                {option['ini'] ? (
                    <div className='plugin-config'>
                        ini entries:
                        {option['ini'].map((v, i) => (
                            <p key={i}>
                                [{v.section}]
                                <br />
                                {v.key} = {v.default ? v.default : 'VALUE'}
                            </p>
                        ))}
                    </div>
                ) : null}

                {option['env'] ? (
                    <div className='plugin-config'>
                        {option['env'].map((v, i) => (
                            <div key={i}>env: {v.name}</div>
                        ))}
                    </div>
                ) : null}

                {option['vars'] ? (
                    <div className='plugin-config'>
                        {option['vars'].map((v, i) => (
                            <div>var: {v.name}</div>
                        ))}
                    </div>
                ) : null}
            </React.Fragment>
        );
    }

    private renderChoices(option) {
        let choices, defaul;

        if (option['type'] === 'bool') {
            choices = ['no', 'yes'];
            if (option['default'] === true) {
                defaul = 'yes';
            } else if (option['default'] === false) {
                defaul = 'no';
            }
        } else {
            choices = option['choices'] || [];
            defaul = option['default'];
        }

        return (
            <React.Fragment>
                {choices && Array.isArray(choices) && choices.length !== 0 ? (
                    <div>
                        <span className='option-name'>Choices: </span>
                        <ul>
                            {choices.map((c, i) => (
                                <li key={i}>
                                    {c === defaul ? (
                                        <span className='blue'>
                                            {c} &nbsp;&larr;
                                        </span>
                                    ) : (
                                        c
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {defaul && !choices.includes(defaul) ? (
                    <span>
                        <span className='option-name'>Default: </span>
                        <span className='blue'>{defaul}</span>
                    </span>
                ) : null}
            </React.Fragment>
        );
    }

    private renderNotes(doc: PluginDoc) {
        if (!doc.notes) {
            return null;
        }

        return (
            <React.Fragment>
                <h2 id='notes'>Notes</h2>
                <ul>
                    {doc.notes.map((note, i) => (
                        <li key={i}>{this.applyDocFormatters(note)}</li>
                    ))}
                </ul>
            </React.Fragment>
        );
    }

    private renderRequirements(doc: PluginDoc) {
        if (!doc.requirements) {
            return null;
        }

        return (
            <React.Fragment>
                <h2>Requirements</h2>
                <ul>
                    {doc.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                    ))}
                </ul>
            </React.Fragment>
        );
    }

    private renderExample(example: string) {
        if (!example) {
            return null;
        }
        return (
            <React.Fragment>
                <h2 id='examples'>Examples</h2>
                <pre>{example}</pre>
            </React.Fragment>
        );
    }

    private renderReturnValues(returnV: ReturnedValue[], maxDepth: number) {
        if (!returnV) {
            return null;
        }
        return (
            <React.Fragment>
                <h2 id='return-values'>Return Values</h2>
                <table className='options-table'>
                    <tbody>
                        <tr>
                            <th colSpan={maxDepth + 1}>Key</th>
                            <th>Returned</th>
                            <th>Description</th>
                        </tr>
                        {this.renderReturnValueEntries(
                            returnV,
                            0,
                            maxDepth,
                            '',
                        )}
                    </tbody>
                </table>
            </React.Fragment>
        );
    }

    private renderReturnValueEntries(
        returnValues: ReturnedValue[],
        depth: number,
        maxDepth: number,
        parent: string,
    ) {
        let entries = [];

        returnValues.forEach((option, i) => {
            const spacers = [];
            for (let x = 0; x < depth; x++) {
                spacers.push(<td key={x} colSpan={1} className='spacer' />);
            }
            const key = `${parent}-${option.name}`;
            entries.push(
                <tr key={key}>
                    {spacers}
                    <td
                        colSpan={maxDepth + 1 - depth}
                        className={option.contains ? 'parent' : ''}
                    >
                        {option.name} <br /> ({option.type})
                    </td>
                    <td>{option.returned}</td>
                    <td>
                        {option.description.map((d, i) => (
                            <p key={i}>{this.applyDocFormatters(d)}</p>
                        ))}

                        {option.sample ? (
                            <div>
                                <br />
                                sample:
                                {typeof option.sample === 'string' ? (
                                    option.sample
                                ) : (
                                    <pre>
                                        {JSON.stringify(option.sample, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ) : null}
                    </td>
                </tr>,
            );

            if (option.contains) {
                entries = entries.concat(
                    // recursively render values
                    this.renderReturnValueEntries(
                        option.contains,
                        depth + 1,
                        maxDepth,
                        key,
                    ),
                );
            }
        });
        return entries;
    }

    // https://github.com/ansible/ansible/blob/1b8aa798df6f6fa96ba5ea2a9dbf01b3f1de555c/hacking/build_library/build_ansible/jinja2/filters.py#L53
    private documentedType(text) {
        switch (text) {
            case 'str':
                return 'string';
            case 'bool':
                return 'boolean';
            case 'int':
                return 'integer';
            case 'dict':
                return 'dictionary';
            case undefined:
                return '-';
            default:
                return text;
        }
    }
}
