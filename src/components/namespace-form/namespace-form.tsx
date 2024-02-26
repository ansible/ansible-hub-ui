import { t } from '@lingui/macro';
import { Form, FormGroup, TextArea, TextInput } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import React, { Component } from 'react';
import { NamespaceType } from 'src/api';
import { FormFieldHelper, NamespaceCard } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { ErrorMessagesType, validateURLHelper } from 'src/utilities';
import './namespace-form.scss';

interface IProps {
  namespace: NamespaceType;
  errorMessages: ErrorMessagesType;

  updateNamespace: (namespace) => void;
}

export class NamespaceForm extends Component<IProps> {
  static contextType = AppContext;

  render() {
    const { namespace, errorMessages } = this.props;

    if (!namespace) {
      return null;
    }

    return (
      <Form>
        <div className='hub-card-row'>
          <div className='fields'>
            <FormGroup fieldId='name' label={t`Name`} isRequired>
              <TextInput
                isRequired
                isDisabled
                id='name'
                type='text'
                value={namespace.name}
              />
            </FormGroup>

            <br />

            <FormGroup fieldId='company' label={t`Company name`}>
              <TextInput
                validated={'company' in errorMessages ? 'error' : 'default'}
                id='company'
                type='text'
                value={namespace.company}
                onChange={(event, value) => this.updateField(value, event)}
              />
              <FormFieldHelper
                variant={'company' in errorMessages ? 'error' : 'default'}
              >
                {errorMessages['company']}
              </FormFieldHelper>
            </FormGroup>
          </div>
          <div className='card'>
            <NamespaceCard namespace={namespace} />
          </div>
        </div>

        <FormGroup fieldId='avatar_url' label={t`Logo URL`}>
          <TextInput
            validated={'avatar_url' in errorMessages ? 'error' : 'default'}
            id='avatar_url'
            type='text'
            value={namespace.avatar_url}
            onChange={(event, value) => this.updateField(value, event)}
          />
          <FormFieldHelper
            variant={'avatar_url' in errorMessages ? 'error' : 'default'}
          >
            {errorMessages['avatar_url']}
          </FormFieldHelper>
        </FormGroup>

        <FormGroup fieldId='description' label={t`Description`}>
          <TextArea
            validated={'description' in errorMessages ? 'error' : 'default'}
            id='description'
            type='text'
            value={namespace.description}
            onChange={(event, value) => this.updateField(value, event)}
          />
          <FormFieldHelper
            variant={'description' in errorMessages ? 'error' : 'default'}
          >
            {errorMessages['description']}
          </FormFieldHelper>
        </FormGroup>

        <FormGroup fieldId='links' label={t`Useful links`}>
          {namespace.links.map((link, index) =>
            this.renderLinkGroup(link, index),
          )}

          {namespace.links.length === 0 && (
            <PlusCircleIcon
              className='clickable'
              onClick={() => this.addLink()}
              size='sm'
            />
          )}

          <FormFieldHelper
            variant={
              'links__url' in errorMessages || 'links__name' in errorMessages
                ? 'error'
                : 'default'
            }
          >
            {this.getLinksErrorText(errorMessages)}
          </FormFieldHelper>
        </FormGroup>
      </Form>
    );
  }

  private getLinksErrorText(errorMessages): string {
    const msg: string[] = [];
    if ('links__name' in errorMessages) {
      msg.push(t`Text: ${errorMessages['links__name']}`);
    }
    if ('links__url' in errorMessages) {
      msg.push(t`URL: ${errorMessages['links__url']}`);
    }

    return msg.join(' ');
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
      name: '',
      url: '',
    });

    this.props.updateNamespace(update);
  }

  public static validateName(link): {
    variant: 'default' | 'error';
    children?: string;
  } {
    if (link.url) {
      if (link.name) {
        return { variant: 'default' };
      } else {
        return {
          variant: 'error',
          children: t`Name must not be empty.`,
        };
      }
    }

    // if link url is empty, there is no need to insert name because the link data will be discarded
    return { variant: 'default' };
  }

  public static validateUrl(link): {
    variant: 'default' | 'warning' | 'error';
    children?: string;
  } {
    if (link.url) {
      // only validate url if input is not blank, blank inputs are thrown away
      return validateURLHelper(undefined, link.url);
    }

    if (link.name) {
      return {
        variant: 'error',
        children: t`URL must not be empty.`,
      };
    }

    return { variant: 'default' };
  }

  private renderLinkGroup(link, index) {
    const last = index === this.props.namespace.links.length - 1;
    return (
      <div className='useful-links' key={index}>
        <div className='link-name'>
          <FormGroup fieldId={'name'}>
            <TextInput
              id='name'
              type='text'
              placeholder={t`Link text`}
              value={link.name}
              onChange={(event, value) => this.updateLink(index, value, event)}
              validated={NamespaceForm.validateName(link).variant}
            />
            <FormHelperText {...NamespaceForm.validateName(link)} />
          </FormGroup>
        </div>
        <div className='link-url'>
          <FormGroup fieldId={'link'}>
            <TextInput
              id='url'
              type='text'
              placeholder={t`Link URL`}
              value={link.url}
              onChange={(event, value) => this.updateLink(index, value, event)}
              validated={NamespaceForm.validateUrl(link.url).variant}
            />
            <FormHelperText {...NamespaceForm.validateUrl(link)} />
          </FormGroup>
        </div>
        <div className='link-button'>
          <div className='link-container'>
            <TrashIcon
              className='clickable'
              onClick={() => this.removeLink(index)}
              size='sm'
            />
          </div>

          <div className='link-container'>
            {last && (
              <PlusCircleIcon
                className='clickable'
                onClick={() => this.addLink()}
                size='sm'
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
