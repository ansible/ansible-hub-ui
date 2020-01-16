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
    namespaceGroups: Array<string>;
    newNamespaceGroup: string;
}

export class NamespaceForm extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            newLinkURL: '',
            newLinkName: '',
            namespaceGroups: props.namespace.groups,
            newNamespaceGroup: '',
        };
    }

    render() {
        const { namespace, errorMessages } = this.props;
        const { namespaceGroups } = this.state;

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
                          fieldId='groups'
                          label='Red Hat Accounts'
                          helperTextInvalid={errorMessages['groups']}
                          isValid={!('groups' in errorMessages)}
                        >
                            <br/>
                            <ChipGroup>
                                {namespaceGroups.map(group => (
                                    <Chip key={group}onClick={() => this.deleteItem(group)}>
                                        {group}
                                    </Chip>
                                ))}
                            </ChipGroup>
                            <div className='account-ids'>
                                <div className='account-id'>
                                    <TextInput
                                        id='url'
                                        type='text'
                                        placeholder='Red Hat Account ID'
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
                                </div>
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
      let groups = this.state.namespaceGroups;
      groups.push(this.state.newNamespaceGroup.trim());
      this.setState({ namespaceGroups: groups, newNamespaceGroup: ''});
    }

    private deleteItem(id) {
      const groups = this.state.namespaceGroups;
      const index = groups.indexOf(id);
      if (index !== -1) {
        groups.splice(index, 1);
        this.setState({ namespaceGroups: groups });
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
