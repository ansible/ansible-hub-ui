import * as React from 'react';
import './namespace-form.scss';

import { Form, FormGroup, TextInput, TextArea } from '@patternfly/react-core';
import { Chip, ChipGroup, ChipGroupToolbarItem } from '@patternfly/react-core';
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
    newNamespaceGroup: string;
}

export class NamespaceForm extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            newLinkURL: '',
            newLinkName: '',
            newNamespaceGroup: '',
        };
    }

    render() {
        const { namespace, errorMessages } = this.props;

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
                            label='Company name'
                            helperTextInvalid={errorMessages['company']}
                            isValid={!('company' in errorMessages)}
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

                <FormGroup
                    fieldId='groups'
                    label='Namespace owners'
                    helperTextInvalid={errorMessages['groups']}
                    isValid={!('groups' in errorMessages)}
                >
                    <br />

                    <ChipGroup>
                        {this.props.namespace.groups.map(group => (
                            <Chip
                                key={group}
                                onClick={() => this.deleteItem(group)}
                                isReadOnly={group === 'system:partner-engineers'}
                            >
                                {group.split(':')[1]}
                            </Chip>
                        ))}
                    </ChipGroup>

                    <div className='account-ids'>
                        <br />
                        <TextInput
                            id='url'
                            type='text'
                            placeholder='Red Hat account ID'
                            value={this.state.newNamespaceGroup}
                            onChange={value =>
                                this.setState({
                                    newNamespaceGroup: value,
                                })
                            }
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    this.addGroup();
                                }
                            }}
                        />
                        <div className='account-add'>
                            <div className='clickable account-button'>
                                <PlusCircleIcon
                                    onClick={() => this.addGroup()}
                                    size='md'
                                />
                            </div>
                        </div>
                    </div>
                </FormGroup>

                <FormGroup
                    fieldId='avatar_url'
                    label='Logo URL'
                    helperTextInvalid={errorMessages['avatar_url']}
                    isValid={!('avatar_url' in errorMessages)}
                >
                    <TextInput
                        id='avatar_url'
                        type='text'
                        value={namespace.avatar_url}
                        onChange={(value, event) =>
                            this.updateField(value, event)
                        }
                    />
                </FormGroup>

                <FormGroup
                    fieldId='description'
                    label='Description'
                    helperTextInvalid={errorMessages['description']}
                    isValid={!('description' in errorMessages)}
                >
                    <TextArea
                        id='description'
                        type='text'
                        value={namespace.description}
                        onChange={(value, event) =>
                            this.updateField(value, event)
                        }
                    />
                </FormGroup>

                {namespace.links.length > 0 ? (
                    <FormGroup
                        fieldId='links'
                        label='Useful links'
                        helperTextInvalid={
                            errorMessages['name'] || errorMessages['url']
                        }
                        isValid={
                            !('name' in errorMessages || 'url' in errorMessages)
                        }
                    >
                        {namespace.links.map((link, index) =>
                            this.renderLinkGroup(link, index),
                        )}
                    </FormGroup>
                ) : null}

                <FormGroup fieldId='add_link' label='Add link'>
                    <div className='useful-links'>
                        <div className='link-name'>
                            <TextInput
                                id='name'
                                type='text'
                                placeholder='Link text'
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
                                placeholder='Link URL'
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
        update.links[index][event.target.id] = value;
        this.props.updateNamespace(update);
    }

    private removeLink(index) {
        const update = { ...this.props.namespace };
        update.links.splice(index, 1);
        this.props.updateNamespace(update);
    }

    private addLink() {
        const update = { ...this.props.namespace };
        update.links.push({
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

    private addGroup() {
        const update = { ...this.props.namespace };
        update.groups.push(
            'rh-identity-account:' + this.state.newNamespaceGroup.trim(),
        );
        this.setState({ newNamespaceGroup: '' }, () =>
            this.props.updateNamespace(update),
        );
    }

    private deleteItem(id) {
        const update = { ...this.props.namespace };
        const index = update.groups.indexOf(id);
        if (index !== -1) {
            update.groups.splice(index, 1);
            this.props.updateNamespace(update);
        }
    }

    private renderLinkGroup(link, index) {
        return (
            <div className='useful-links' key={index}>
                <div className='link-name'>
                    <TextInput
                        id='name'
                        type='text'
                        placeholder='Link text'
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
                        className='clickable'
                        onClick={() => this.removeLink(index)}
                        size='md'
                    />
                </div>
            </div>
        );
    }
}
