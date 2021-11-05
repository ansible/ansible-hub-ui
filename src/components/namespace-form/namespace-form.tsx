import { t } from '@lingui/macro';
import * as React from 'react';
import './namespace-form.scss';

import {
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Alert,
} from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';

import {
  NamespaceCard,
  ObjectPermissionField,
  AlertType,
} from 'src/components';
import { NamespaceType } from 'src/api';

interface IProps {
  namespace: NamespaceType;
  errorMessages: any;
  userId: string;

  updateNamespace: (namespace) => void;
}

interface IState {
  newNamespaceGroup: string;
  formErrors?: {
    groups?: AlertType;
  };
}

export class NamespaceForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      newNamespaceGroup: '',
      formErrors: {
        groups: null,
      },
    };
  }

  render() {
    const { namespace, errorMessages, userId } = this.props;

    const { formErrors } = this.state;

    if (!namespace) {
      return null;
    }
    return (
      <Form>
        <div className='card-row'>
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

            <FormGroup
              fieldId='company'
              label={t`Company name`}
              helperTextInvalid={errorMessages['company']}
              validated={this.toError(!('company' in errorMessages))}
            >
              <TextInput
                validated={this.toError(!('company' in errorMessages))}
                isRequired
                id='company'
                type='text'
                value={namespace.company}
                onChange={(value, event) => this.updateField(value, event)}
              />
            </FormGroup>
          </div>
          <div className='card'>
            <NamespaceCard {...namespace} />
          </div>
        </div>

        <FormGroup
          fieldId='groups'
          label={t`Namespace owners`}
          className='namespace-owners'
          helperTextInvalid={errorMessages['groups']}
          validated={this.toError(
            !isNaN(Number(this.state.newNamespaceGroup)) &&
              !('groups' in errorMessages),
          )}
        >
          <br />
          {!!formErrors?.groups ? (
            <Alert title={formErrors.groups.title} variant='danger' isInline>
              {formErrors.groups.description}
            </Alert>
          ) : (
            <ObjectPermissionField
              groups={namespace.groups}
              availablePermissions={['change_namespace', 'upload_to_namespace']}
              setGroups={(g) => {
                const newNS = { ...namespace };
                newNS.groups = g;
                this.props.updateNamespace(newNS);
              }}
              onError={(err) =>
                this.setState({
                  formErrors: {
                    ...this.state.formErrors,
                    groups: {
                      title: 'Error loading groups.',
                      description: err,
                      variant: 'danger',
                    },
                  },
                })
              }
            ></ObjectPermissionField>
          )}
        </FormGroup>

        <FormGroup
          fieldId='avatar_url'
          label={t`Logo URL`}
          helperTextInvalid={errorMessages['avatar_url']}
          validated={this.toError(!('avatar_url' in errorMessages))}
        >
          <TextInput
            validated={this.toError(!('avatar_url' in errorMessages))}
            id='avatar_url'
            type='text'
            value={namespace.avatar_url}
            onChange={(value, event) => this.updateField(value, event)}
          />
        </FormGroup>

        <FormGroup
          fieldId='description'
          label={t`Description`}
          helperTextInvalid={errorMessages['description']}
          validated={this.toError(!('description' in errorMessages))}
        >
          <TextArea
            validated={this.toError(!('description' in errorMessages))}
            id='description'
            type='text'
            value={namespace.description}
            onChange={(value, event) => this.updateField(value, event)}
          />
        </FormGroup>

        <FormGroup
          fieldId='links'
          label={t`Useful links`}
          helperTextInvalid={this.getLinksErrorText(errorMessages)}
          validated={this.toError(
            !('links__url' in errorMessages || 'links__name' in errorMessages),
          )}
        >
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

  private toError(validated: boolean) {
    if (validated) {
      return 'default';
    } else {
      return 'error';
    }
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

  private renderLinkGroup(link, index) {
    const last = index === this.props.namespace.links.length - 1;
    return (
      <div className='useful-links' key={index}>
        <div className='link-name'>
          <TextInput
            id='name'
            type='text'
            placeholder={t`Link text`}
            value={link.name}
            onChange={(value, event) => this.updateLink(index, value, event)}
          />
        </div>
        <div className='link-url'>
          <TextInput
            id='url'
            type='text'
            placeholder={t`Link URL`}
            value={link.url}
            onChange={(value, event) => this.updateLink(index, value, event)}
          />
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
