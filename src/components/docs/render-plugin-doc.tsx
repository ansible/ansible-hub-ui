import * as React from 'react';
import './render-plugin-doc.scss';

import { ChevronRightIcon } from '@patternfly/react-icons';

import { PluginContentType } from '../../api';

interface IProps {
    plugin: PluginContentType;
}

export class RenderPluginDoc extends React.Component<IProps> {
    render() {
        const { plugin } = this.props;

        let short_description, description, parameters;

        // None of these variables are guaranteed to exist, so to prevent
        // type errors we're going to inspect the API response for each field
        // the UI expects and if it exists, map it to a JSX expression.
        if (plugin.doc_strings.doc) {
            const doc = plugin.doc_strings.doc;

            if (doc['short_description']) {
                short_description = <div>{doc['short_description']}</div>;
            }

            if (doc['description']) {
                description = (
                    <React.Fragment>
                        <h2>Synopsis</h2>
                        <ul>
                            {plugin.doc_strings.doc['description'].map(
                                (d, i) => (
                                    <li key={i}>{d}</li>
                                ),
                            )}
                        </ul>
                    </React.Fragment>
                );
            }

            if (doc['options']) {
                parameters = this.getParameters(
                    doc['options'],
                    plugin['content_type'],
                );
            }
        }

        // the JSX here shouldn't refer to the plugin variable at all
        return (
            <div className='pf-c-content'>
                <h1>
                    {plugin.content_type} > {plugin.content_name}
                </h1>
                <br />
                {short_description}
                {description}
                {parameters}

                <h2>Examples</h2>
                <pre>{plugin.doc_strings.examples}</pre>

                <h2>Return Values</h2>
                <table className='options-table'>
                    <tbody>
                        <tr>
                            <th>Key</th>
                            <th>Returned</th>
                            <th>Description</th>
                        </tr>
                        {plugin.doc_strings.return.map((option, i) => (
                            <tr key={i}>
                                <td>
                                    {option.name} <br /> ({option.type})
                                </td>
                                <td>{option.return}</td>
                                <td>
                                    {option.description}
                                    <br />
                                    sample: {option.sample}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    private getParameters(parameters, content_type) {
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
                                                /{' '}
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
