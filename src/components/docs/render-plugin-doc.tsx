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
        return (
            <div className='pf-c-content'>
                <h1>
                    {plugin.content_type} > {plugin.content_name}
                </h1>
                <br />
                <div>{plugin.doc_strings.doc['description']}</div>

                <h2>Synopsis</h2>
                <ul>
                    {plugin.doc_strings.doc['description'].map((d, i) => (
                        <li key={i}>{d}</li>
                    ))}
                </ul>

                <h2>Parameters</h2>
                <table className='options-table'>
                    <tbody>
                        <tr>
                            <th>Parameter</th>
                            <th>Choices/Defaults</th>
                            <th>Comments</th>
                        </tr>
                        {plugin.doc_strings.doc['options'].map((option, i) => (
                            <tr key={i}>
                                <td>{option.name}</td>
                                <td>{option.default}</td>
                                <td>
                                    {option.description.map((d, i) => (
                                        <p key={i}>{d}</p>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

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
}
