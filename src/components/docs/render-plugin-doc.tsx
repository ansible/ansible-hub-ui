import * as React from 'react';
import './render-plugin-doc.scss';

import { ChevronRightIcon } from '@patternfly/react-icons';

import { PluginContentType } from '../../api';

interface IProps {
    plugin: PluginContentType;
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

export class RenderPluginDoc extends React.Component<IProps> {
    render() {
        const { plugin } = this.props;

        const doc: PluginDoc = this.parseDocString(plugin);
        const example: string = this.parseExamples(plugin);
        const returnVals: ReturnedValue[] = this.parseReturn(plugin);

        return (
            <div className='pf-c-content'>
                <h1>
                    {plugin.content_type} > {plugin.content_name}
                </h1>
                <br />
                {this.renderShortDescription(doc)}
                {this.renderDescription(doc)}
                {this.renderRequirements(doc)}
                {this.renderParameters(doc.options, plugin.content_type)}
                {this.renderNotes(doc)}
                {this.renderExample(example)}
                {this.renderReturnValues(returnVals)}
            </div>
        );
    }

    private parseDocString(plugin: PluginContentType): PluginDoc {
        // TODO: make the doc string match the desired output as closely as
        // possible
        if (!plugin.doc_strings) {
            return { description: [], shortDescription: '' } as PluginDoc;
        }
        return plugin.doc_strings.doc as PluginDoc;
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

    private renderShortDescription(doc: PluginDoc) {
        return <div>{doc['short_description']}</div>;
    }

    private renderDescription(doc: PluginDoc) {
        return (
            <React.Fragment>
                <h2>Synopsis</h2>
                <ul>
                    {doc.description.map((d, i) => (
                        <li key={i}>{d}</li>
                    ))}
                </ul>
            </React.Fragment>
        );
    }

    private renderParameters(parameters: PluginOption[], content_type: string) {
        if (!parameters) {
            return null;
        }
        return (
            <React.Fragment>
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
                                        <p key={i}>{d}</p>
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
            <div>
                <h2>Notes</h2>
                <ul>
                    {doc.notes.map((note, i) => (
                        <li key={i}>{note}</li>
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
                <h2>Requirments</h2>
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
                <h2>Examples</h2>
                <pre>{example}</pre>
            </React.Fragment>
        );
    }

    private renderReturnValues(returnV: ReturnedValue[]) {
        if (!returnV) {
            return null;
        }
        return (
            <React.Fragment>
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
                                    {option.description}
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
