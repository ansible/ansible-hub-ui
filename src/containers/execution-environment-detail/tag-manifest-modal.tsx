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
  Alert,
  AlertActionLink,
} from '@patternfly/react-core';

import { TagIcon } from '@patternfly/react-icons';

import { ContainerManifestType, ExecutionEnvironmentAPI } from 'src/api';

interface IState {
  tagsToAdd: string[];
  tagsToRemove: string[];
  isSaving: boolean;
  tagInForm: string;
  verifyingTag: boolean;
  tagToVerify: string;
}

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  containerManifest: ContainerManifestType;
  reloadManifests: () => void;
  repository: string;
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
      verifyingTag: false,
      tagToVerify: '',
    };
  }

  render() {
    const { children, closeModal, isOpen, containerManifest } = this.props;

    const {
      tagInForm,
      isSaving,
      tagToVerify,
      verifyingTag,
      tagsToAdd,
      tagsToRemove,
    } = this.state;
    if (!containerManifest) {
      return null;
    }

    return (
      <Modal
        actions={[
          <Button
            key='delete'
            onClick={() => console.log('saved')}
            isDisabled={
              isSaving || (tagsToAdd.length <= 0 && tagsToRemove.length <= 0)
            }
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
                isDisabled={!!tagToVerify || verifyingTag}
                onKeyUp={e => {
                  if (e.key === 'Enter') {
                    this.verifyAndAddTag();
                  }
                }}
              />
              <Button
                aria-label='add new tag to image'
                variant='secondary'
                onClick={this.verifyAndAddTag}
                isDisabled={!!tagToVerify || verifyingTag}
              >
                Add {verifyingTag && <Spinner size='sm'></Spinner>}
              </Button>
            </InputGroup>
          </FormGroup>
          {tagToVerify && (
            <Alert
              variant='warning'
              isInline
              title='This tag already exists on another image. Do you want to move it to this image?'
              actionLinks={
                <>
                  <AlertActionLink
                    onClick={() =>
                      this.setState({ tagToVerify: '', tagInForm: '' }, () =>
                        this.addTag(tagToVerify),
                      )
                    }
                  >
                    Yes
                  </AlertActionLink>
                  <AlertActionLink
                    onClick={() => this.setState({ tagToVerify: '' })}
                  >
                    No
                  </AlertActionLink>
                </>
              }
            />
          )}

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

  private verifyAndAddTag = () => {
    // copy tag to prevent it from changing in the form during verification
    const tag = `${this.state.tagInForm}`;

    this.setState({ verifyingTag: true }, () => this.verifyTag(tag));
  };

  private verifyTag(tag: string) {
    ExecutionEnvironmentAPI.image(this.props.repository, tag)
      .then(result => {
        this.setState({ tagToVerify: tag, verifyingTag: false });
      })
      .catch(err => {
        this.setState({ tagInForm: '', verifyingTag: false }, () =>
          this.addTag(tag),
        );
      });
  }

  private addTag(tag: string) {
    const toAdd = new Set(this.state.tagsToAdd);
    const toRemove = new Set(this.state.tagsToRemove);

    toAdd.add(tag);
    toRemove.delete(tag);

    this.setState({
      tagsToAdd: Array.from(toAdd),
      tagsToRemove: Array.from(toRemove),
    });
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
