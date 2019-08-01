import * as React from 'react';
import './namespace-form.scss';

import { Form, FormGroup, TextInput, TextArea } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { NamespaceCard } from '../../components';
import { NamespaceType } from '../../api';

interface IProps {
    namespace: NamespaceType;
    errorMessages: any;

    updateNamespace: (namespace) => void;
}

interface IState {
    newLinkName: string;
    newLinkURL: string;
}

export class NamespaceForm extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            newLinkURL: '',
            newLinkName: '',
        };
    }

    render() {
        // TODO: Add error messages and validation
        const { namespace } = this.props;

        if (!namespace) {
            return null;
        }
        return (
            <Form>
                <div className='card-row'>
                    <div className='fields'>
                        <FormGroup fieldId='name' label='Name' isRequired>
                            <TextInput
                                isRequired
                                isDisabled
                                id='name'
                                type='text'
                                value={namespace.name}
                            />
                        </FormGroup>

                        <br />

                        <FormGroup
                            fieldId='company'
                            label='Company Name'
                            isRequired
                        >
                            <TextInput
                                isRequired
                                id='company'
                                type='text'
                                value={namespace.company}
                                onChange={(value, event) =>
                                    this.updateField(value, event)
                                }
                            />
                        </FormGroup>
                    </div>
                    <div className='card'>
                        <NamespaceCard {...namespace} />
                    </div>
                </div>

                <FormGroup fieldId='avatar_url' label='Logo URL'>
                    <TextInput
                        id='avatar_url'
                        type='text'
                        value={namespace.avatar_url}
                        onChange={(value, event) =>
                            this.updateField(value, event)
                        }
                    />
                </FormGroup>

                <FormGroup fieldId='description' label='Description'>
                    <TextArea
                        id='description'
                        type='text'
                        value={namespace.description}
                        onChange={(value, event) =>
                            this.updateField(value, event)
                        }
                    />
                </FormGroup>

                {namespace.useful_links.length > 0 ? (
                    <FormGroup fieldId='useful_links' label='Useful Links'>
                        {namespace.useful_links.map((link, index) =>
                            this.renderLinkGroup(link, index),
                        )}
                    </FormGroup>
                ) : null}

                <FormGroup fieldId='add_link' label='Add Link'>
                    <div className='useful-links'>
                        <div className='link-name'>
                            <TextInput
                                id='name'
                                type='text'
                                placeholder='Link Text'
                                value={this.state.newLinkName}
                                onChange={value => {
                                    this.setState({
                                        newLinkName: value,
                                    });
                                }}
                            />
                        </div>
                        <div className='link-url'>
                            <TextInput
                                id='url'
                                type='text'
                                placeholder='Link Url'
                                value={this.state.newLinkURL}
                                onChange={value =>
                                    this.setState({
                                        newLinkURL: value,
                                    })
                                }
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        this.addLink();
                                    }
                                }}
                            />
                        </div>
                        <div className='clickable link-button'>
                            <PlusCircleIcon
                                onClick={() => this.addLink()}
                                size='md'
                            />
                        </div>
                    </div>
                </FormGroup>
            </Form>
        );
    }

    private updateField(value, event) {
        const update = { ...this.props.namespace };
        update[event.target.id] = value;
        this.props.updateNamespace(update);
    }

    private updateLink(index, value, event) {
        const update = { ...this.props.namespace };
        update.useful_links[index][event.target.id] = value;
        this.props.updateNamespace(update);
    }

    private removeLink(index) {
        const update = { ...this.props.namespace };
        update.useful_links.splice(index, 1);
        this.props.updateNamespace(update);
    }

    private addLink() {
        const update = { ...this.props.namespace };
        update.useful_links.push({
            name: this.state.newLinkName,
            url: this.state.newLinkURL,
        });
        this.setState(
            {
                newLinkURL: '',
                newLinkName: '',
            },
            () => this.props.updateNamespace(update),
        );
    }

    private renderLinkGroup(link, index) {
        return (
            <div className='useful-links' key={index}>
                <div className='link-name'>
                    <TextInput
                        id='name'
                        type='text'
                        placeholder='Link Text'
                        value={link.name}
                        onChange={(value, event) =>
                            this.updateLink(index, value, event)
                        }
                    />
                </div>
                <div className='link-url'>
                    <TextInput
                        id='url'
                        type='text'
                        placeholder='Link URL'
                        value={link.url}
                        onChange={(value, event) =>
                            this.updateLink(index, value, event)
                        }
                    />
                </div>
                <div className='link-button'>
                    <MinusCircleIcon
                        onClick={() => this.removeLink(index)}
                        size='md'
                    />
                </div>
            </div>
        );
    }
}
