import * as React from 'react';

import {
  Button,
  Modal,
  Spinner,
  Label,
  LabelGroup,
  Form,
  FormGroup,
  TextInput,
  InputGroup,
} from '@patternfly/react-core';

import { TagIcon } from '@patternfly/react-icons';

import { ContainerManifestType } from 'src/api';

interface IState {
  tagsToAdd: string[];
  tagsToRemove: string[];
  isSaving: boolean;
  tagInForm: string;
}

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  containerManifest: ContainerManifestType;
  reloadManifests: () => void;
}

/*
Add:
  - GET: _content/images/<tag>/
  - if image exists, ask for confirmation
  - post to tag endpoint
  - ping tasking system and wait until the task is marked as done
  - when task is done, refresh image list on parent component

Delete:
  - post to tag endpoint
  - ping tasking system and wait until the task is marked as done
  - when task is done, refresh image list on parent component
*/

export class TagManifestModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      isSaving: false,
      tagsToAdd: [],
      tagsToRemove: [],
      tagInForm: '',
    };
  }

  render() {
    const { children, closeModal, isOpen, containerManifest } = this.props;

    const { tagInForm, isSaving } = this.state;
    if (!containerManifest) {
      return null;
    }

    return (
      <Modal
        actions={[
          <Button
            key='delete'
            onClick={() => console.log('saved')}
            isDisabled={isSaving}
          >
            Save
            {isSaving && <Spinner size='sm'></Spinner>}
          </Button>,
          <Button key='cancel' onClick={() => closeModal()} variant='link'>
            Cancel
          </Button>,
        ]}
        isOpen={isOpen}
        onClose={() => closeModal()}
        title='Manage tags'
        variant='small'
      >
        <Form>
          <FormGroup fieldId='add-new-tag' label='Add new tag'>
            <InputGroup>
              <TextInput
                type='text'
                id='add-new-tag'
                name='add-new-tag'
                value={tagInForm}
                onChange={val => this.setState({ tagInForm: val })}
              />
              <Button variant='secondary'>Add</Button>
            </InputGroup>
          </FormGroup>

          <FormGroup fieldId='remove-tag' label='Current tags'>
            <LabelGroup id='remove-tag' defaultIsOpen={true}>
              {this.getCurrentTags().map(tag => (
                <Label
                  icon={<TagIcon />}
                  onClose={() => this.removeTag(tag)}
                  key={tag}
                >
                  {tag}
                </Label>
              ))}
            </LabelGroup>
          </FormGroup>
        </Form>
      </Modal>
    );
  }

  private removeTag(tag: string) {
    const toAdd = new Set(this.state.tagsToAdd);
    const toRemove = new Set(this.state.tagsToRemove);

    toAdd.delete(tag);
    toRemove.add(tag);

    this.setState({
      tagsToAdd: Array.from(toAdd),
      tagsToRemove: Array.from(toRemove),
    });
  }

  private getCurrentTags() {
    const tags = new Set([
      ...this.props.containerManifest.tags,
      ...this.state.tagsToAdd,
    ]);

    for (const tag of this.state.tagsToRemove) {
      tags.delete(tag);
    }

    return Array.from(tags.values());
  }
}
