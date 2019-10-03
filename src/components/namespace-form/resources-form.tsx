import * as React from 'react';
import './namespace-form.scss';

import { Form, FormGroup, TextArea } from '@patternfly/react-core';
import * as ReactMarkdown from 'react-markdown';

import { NamespaceType } from '../../api';

const placeholder = `## Custom Resources

You can use this page to add any resources which you think might help your \
users automate all the things.

Consider using it for:

- Links to blog posts
- Training resources
- Documentation
- Cat gifs? If that's your thing :)
`;

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
                                placeholder={placeholder}
                            />
                        </FormGroup>
                    </div>

                    <div className='column preview-container'>
                        Preview
                        <div className='pf-c-content preview'>
                            {namespace.resources ? (
                                <ReactMarkdown source={namespace.resources} />
                            ) : (
                                <ReactMarkdown source={placeholder} />
                            )}
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
