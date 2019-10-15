import * as React from 'react';
import './render-plugin-doc.scss';

import { cloneDeep } from 'lodash';
import { Alert } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

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
    subOptions?: PluginOption[];
}

class PluginDoc {
    shortDescription: string;
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
    description: string;
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

        const doc: PluginDoc = this.parseDocString(plugin);
        const example: string = this.parseExamples(plugin);
        const returnVals: ReturnedValue[] = this.parseReturn(plugin);

        const content: any = {
          "synopsis": this.renderSynopsis(doc),
          "parameters": this.renderParameters(doc.options, plugin.content_type),
          "notes": this.renderNotes(doc),
          "see-also": null,
          "examples": this.renderExample(example),
          "return-values": this.renderReturnValues(returnVals),
          "status": null
        }

        if (!this.state.renderError) {
            return (
                <div className='pf-c-content'>
                    <h1>
                        {plugin.content_type} > {plugin.content_name}
                    </h1>
                    <br />
                    {this.renderTableOfContents(content)}
                    {this.renderShortDescription(doc)}
                    {this.renderDeprecated(doc, plugin.content_name)}
                    {content["synopsis"]}
                    {this.renderRequirements(doc)}
                    {content["parameters"]}
                    {content["notes"]}
                    {content["examples"]}
                    {content["return-values"]}
                </div>
            );
        } else {
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
                            unformatted documentation object bellow if you need
                            to.
                        </p>

                        <h2>Unformatted Documentation</h2>

                        <pre className='plugin-raw'>
                            {JSON.stringify(plugin, null, 2)}
                        </pre>
                    </div>
                </React.Fragment>
            );
        }
    }

    private parseDocString(plugin: PluginContentType): PluginDoc {
        // TODO: if the parser can't figure out what to do with the object
        // passed to it, it should throw an error that can be displayed to the
        // user with the piece of the documention that's broken.

        // TODO: make the doc string match the desired output as closely as
        // possible
        if (!plugin.doc_strings) {
            return { description: [], shortDescription: '' } as PluginDoc;
        }

        const doc: PluginDoc = { ...plugin.doc_strings.doc };

        if (doc.options) {
            for (let op of doc.options) {
                // Description is expected to be an array of strings. If its not,
                // do what we can to make it one
                op.description = this.ensureListofStrings(op.description);

                if (typeof op.default === 'object') {
                    op.default = JSON.stringify(op.default);
                }
            }
        }

        doc.description = this.ensureListofStrings(doc.description);

        return doc as PluginDoc;
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
        const returnV = [] as ReturnedValue[];

        if (!plugin.doc_strings) {
            return null;
        }

        if (!plugin.doc_strings.return) {
            return null;
        }

        for (let r of plugin.doc_strings.return) {
            returnV.push({
                ...r,
            });
        }
        return plugin.doc_strings.return;
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
                            // TODO: figure out how to make this use the Link
                            // component so it doesn't reload the whole app
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
              {content["synopsis"] !== null &&
                  <li>
                      <Link to="#synopsis">Synopsis</Link>
                  </li>
              }
              {content["parameters"] !== null &&
                  <li>
                      <Link to="#parameters">Parameters</Link>
                  </li>
              }
              {content["notes"] !== null &&
                  <li>
                      <Link to="#notes">Notes</Link>
                  </li>
              }
              {content["examples"] !== null &&
                  <li>
                      <Link to="#examples">Examples</Link>
                  </li>
              }
              {content["return-values"] !== null &&
                  <li>
                      <Link to="#return-values">Return Values</Link>
                  </li>
              }
            </ul>
          );
    }

    private renderShortDescription(doc: PluginDoc) {
        return <div>{doc['short_description']}</div>;
    }

    private renderSynopsis(doc: PluginDoc) {
        return (
            <React.Fragment>
                <div id="synopsis">
                    <h2>Synopsis</h2>
                    <ul>
                        {doc.description.map((d, i) => (
                            <li key={i}>{this.applyDocFormatters(d)}</li>
                        ))}
                    </ul>
                </div>
            </React.Fragment>
        );
    }

    private renderParameters(parameters: PluginOption[], content_type: string) {
        if (!parameters) {
            return null;
        }
        return (
            <React.Fragment>
                <div id="parameters">
                    <h2>Parameters</h2>
                    <table className='options-table'>
                        <tbody>
                            <tr>
                                <th>Parameter</th>
                                <th>
                                    Choices/<span className='blue'>Defaults</span>
                                </th>
                                {content_type !== 'module' ? (
                                    <th>Configuration</th>
                                ) : null}
                                <th>Comments</th>
                            </tr>
                            {
                                // TODO: add support for sub options. Example:
                                //https://github.com/ansible/ansible/blob/devel/lib/ansible/modules/network/fortios/fortios_dlp_fp_doc_source.py#L93}
                                // TODO: do we need to display version added?
                            }
                            {parameters.map((option, i) => (
                                <tr key={i}>
                                    {
                                        // PARAMETER --------------------------------
                                    }
                                    <td>
                                        <span className='option-name'>
                                            {option.name}
                                        </span>
                                        <small>
                                            {this.documentedType(option['type'])}
                                            {option['elements'] ? (
                                                <span>
                                                    {' '}
                                                    / elements =
                                                    {this.documentedType(
                                                        option['elements'],
                                                    )}
                                                </span>
                                            ) : null}
                                            {option['required'] ? (
                                                <span>
                                                    {' '}
                                                    /{' '}
                                                    <span className='red'>
                                                        required
                                                    </span>
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
                                        <td>
                                            {this.renderPluginConfiguration(option)}
                                        </td>
                                    ) : null}
                                    {
                                        // COMMENTS ------------------------------
                                    }
                                    <td>
                                        {option.description.map((d, i) => (
                                            <p key={i}>
                                                {this.applyDocFormatters(d)}
                                            </p>
                                        ))}

                                        {option['aliases'] ? (
                                            <small>
                                                <span className='green'>
                                                    aliases:{' '}
                                                    {option['aliases'].join(', ')}
                                                </span>
                                            </small>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        );
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
            <div id="notes">
                <h2>Notes</h2>
                <ul>
                    {doc.notes.map((note, i) => (
                        <li key={i}>{this.applyDocFormatters(note)}</li>
                    ))}
                </ul>
            </div>
        );
    }

    private renderRequirements(doc: PluginDoc) {
        if (!doc.requirements) {
            return null;
        }

        return (
            <div>
                <h2>Requirements</h2>
                <ul>
                    {doc.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                    ))}
                </ul>
            </div>
        );
    }

    private renderExample(example: string) {
        if (!example) {
            return null;
        }
        return (
            <React.Fragment>
                <div id="examples">
                    <h2>Examples</h2>
                    <pre>{example}</pre>
                </div>
            </React.Fragment>
        );
    }

    private renderReturnValues(returnV: ReturnedValue[]) {
        if (!returnV) {
            return null;
        }
        return (
            <React.Fragment>
                <div id="return-values">
                    <h2>Return Values</h2>
                    <table className='options-table'>
                        <tbody>
                            <tr>
                                <th>Key</th>
                                <th>Returned</th>
                                <th>Description</th>
                            </tr>
                            {returnV.map((option, i) => (
                                <tr key={i}>
                                    <td>
                                        {option.name} <br /> ({option.type})
                                    </td>
                                    <td>{option.returned}</td>
                                    <td>
                                        {this.applyDocFormatters(
                                            option.description,
                                        )}
                                        {option.sample ? (
                                            <div>
                                                <br />
                                                sample:
                                                {typeof option.sample ===
                                                'string' ? (
                                                    option.sample
                                                ) : (
                                                    <pre>
                                                        {JSON.stringify(
                                                            option.sample,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                )}
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        );
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
