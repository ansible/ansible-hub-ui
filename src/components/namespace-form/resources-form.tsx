import * as React from 'react';
import './namespace-form.scss';

import { Form, FormGroup, TextArea } from '@patternfly/react-core';
import * as ReactMarkdown from 'react-markdown';

import { NamespaceType } from '../../api';

interface IProps {
    namespace: NamespaceType;

    updateNamespace: (data) => void;
}

export class ResourcesForm extends React.Component<IProps, {}> {
    render() {
        const { namespace } = this.props;
        return (
            <Form>
                <div className='markdown-editor'>
                    <div className='column editor'>
                        <FormGroup
                            fieldId='resources'
                            helperText='You can can customize the Resources tab on your profile by entering custom markdown here.'
                        >
                            Raw Markdown
                            <TextArea
                                className='resources-editor'
                                id='resources'
                                value={namespace.resources}
                                onChange={value => this.updateResources(value)}
                            />
                        </FormGroup>
                    </div>

                    <div className='column preview-container'>
                        Preview
                        <div className='pf-c-content preview'>
                            <ReactMarkdown source={namespace.resources} />
                        </div>
                    </div>
                </div>
            </Form>
        );
    }

    private updateResources(data) {
        const update = { ...this.props.namespace };
        update.resources = data;
        this.props.updateNamespace(update);
    }
}

// {this.props.saving ? <Spinner></Spinner> : null}
