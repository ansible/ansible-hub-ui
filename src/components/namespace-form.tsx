import { t } from '@lingui/core/macro';
import { Form, FormGroup, TextArea, TextInput } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import React from 'react';
import { type NamespaceType } from 'src/api';
import { FormFieldHelper, Icon, NamespaceCard } from 'src/components';
import { type ErrorMessagesType, validateURLHelper } from 'src/utilities';
import './namespace-form.scss';

interface IProps {
  errorMessages: ErrorMessagesType;
  namespace: NamespaceType;
  updateNamespace: (namespace) => void;
}

export function validateName(link): {
  variant: 'default' | 'error';
  children?: string;
} {
  if (!link.url) {
    // if link url is empty, the link data will be discarded
    return { variant: 'default' };
  }

  if (link.name) {
    return { variant: 'default' };
  }

  return {
    variant: 'error',
    children: t`Name must not be empty.`,
  };
}

export function validateURL(link): {
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

export const NamespaceForm = ({
  errorMessages,
  namespace,
  updateNamespace,
}: IProps) => {
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
              onChange={(event, value) => updateField(value, event)}
            />
            <FormFieldHelper
              variant={'company' in errorMessages ? 'error' : 'default'}
            >
              {errorMessages['company']}
            </FormFieldHelper>
          </FormGroup>
        </div>
        <div className='hub-namespace-form-card'>
          <NamespaceCard namespace={namespace} />
        </div>
      </div>

      <FormGroup fieldId='avatar_url' label={t`Logo URL`}>
        <TextInput
          validated={'avatar_url' in errorMessages ? 'error' : 'default'}
          id='avatar_url'
          type='text'
          value={namespace.avatar_url}
          onChange={(event, value) => updateField(value, event)}
        />
        <FormFieldHelper
          variant={'avatar_url' in errorMessages ? 'error' : 'default'}
        >
          {errorMessages['avatar_url']}
        </FormFieldHelper>
        <FormFieldHelper variant='indeterminate'>
          {t`Please use a jpeg or png; svg images are not supported.`}
        </FormFieldHelper>
      </FormGroup>

      <FormGroup fieldId='description' label={t`Description`}>
        <TextArea
          validated={'description' in errorMessages ? 'error' : 'default'}
          id='description'
          type='text'
          value={namespace.description}
          onChange={(event, value) => updateField(value, event)}
        />
        <FormFieldHelper
          variant={'description' in errorMessages ? 'error' : 'default'}
        >
          {errorMessages['description']}
        </FormFieldHelper>
      </FormGroup>

      <FormGroup fieldId='links' label={t`Useful links`}>
        {namespace.links.map((link, index) => renderLinkGroup(link, index))}

        {namespace.links.length === 0 && (
          <Icon className='clickable' onClick={() => addLink()}>
            <PlusCircleIcon />
          </Icon>
        )}

        <FormFieldHelper
          variant={
            'links__url' in errorMessages || 'links__name' in errorMessages
              ? 'error'
              : 'default'
          }
        >
          {getLinksErrorText(errorMessages)}
        </FormFieldHelper>
      </FormGroup>
    </Form>
  );

  function getLinksErrorText(errorMessages): string {
    const msg: string[] = [];
    if ('links__name' in errorMessages) {
      msg.push(t`Text: ${errorMessages['links__name']}`);
    }
    if ('links__url' in errorMessages) {
      msg.push(t`URL: ${errorMessages['links__url']}`);
    }

    return msg.join(' ');
  }

  function updateField(value, event) {
    const update = { ...namespace };
    update[event.target.id] = value;
    updateNamespace(update);
  }

  function updateLink(index, value, event) {
    const update = { ...namespace };
    update.links[index][event.target.id] = value;
    updateNamespace(update);
  }

  function removeLink(index) {
    const update = { ...namespace };
    update.links.splice(index, 1);
    updateNamespace(update);
  }

  function addLink() {
    const update = { ...namespace };
    update.links.push({
      name: '',
      url: '',
    });

    updateNamespace(update);
  }

  function renderLinkGroup(link, index) {
    const last = index === namespace.links.length - 1;

    return (
      <div className='useful-links' key={index}>
        <div className='link-name'>
          <FormGroup fieldId={'name'}>
            <TextInput
              id='name'
              type='text'
              placeholder={t`Link text`}
              value={link.name}
              onChange={(event, value) => updateLink(index, value, event)}
              validated={validateName(link).variant}
            />
            <FormFieldHelper {...validateName(link)} />
          </FormGroup>
        </div>
        <div className='link-url'>
          <FormGroup fieldId={'link'}>
            <TextInput
              id='url'
              type='text'
              placeholder={t`Link URL`}
              value={link.url}
              onChange={(event, value) => updateLink(index, value, event)}
              validated={validateURL(link.url).variant}
            />
            <FormFieldHelper {...validateURL(link)} />
          </FormGroup>
        </div>
        <div className='link-button'>
          <div className='link-container'>
            <Icon className='clickable' onClick={() => removeLink(index)}>
              <TrashIcon />
            </Icon>
          </div>

          <div className='link-container'>
            {last && (
              <Icon className='clickable' onClick={() => addLink()}>
                <PlusCircleIcon />
              </Icon>
            )}
          </div>
        </div>
      </div>
    );
  }
};
