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

import {
  ContainerManifestType,
  ExecutionEnvironmentAPI,
  ContainerTagAPI,
  ContainerRepositoryType,
  TaskAPI,
  PulpStatus,
} from 'src/api';

import { parsePulpIDFromURL } from 'src/utilities';

interface IState {
  tagsToAdd: string[];
  tagsToRemove: string[];
  isSaving: boolean;
  tagInForm: string;
  verifyingTag: boolean;
  tagToVerify: string;
  pendingTasks: Number;
  tagInFormError: string;
}

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  containerManifest: ContainerManifestType;
  reloadManifests: () => void;
  repositoryName: string;
}

const VALID_TAG_REGEX = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

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
      pendingTasks: 0,
      tagInFormError: undefined,
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
      pendingTasks,
      tagInFormError,
    } = this.state;
    if (!containerManifest) {
      return null;
    }

    return (
      <Modal
        actions={[
          <Button
            key='save'
            onClick={() => this.saveTags()}
            isDisabled={
              isSaving || (tagsToAdd.length <= 0 && tagsToRemove.length <= 0)
            }
          >
            Save
            {isSaving && <Spinner size='sm'></Spinner>}
          </Button>,
          <Button
            isDisabled={isSaving}
            key='cancel'
            onClick={() => closeModal()}
            variant='link'
          >
            Cancel
          </Button>,
        ]}
        isOpen={isOpen}
        onClose={() => closeModal()}
        title='Manage tags'
        variant='small'
      >
        <Form>
          <FormGroup
            validated={!!tagInFormError ? 'error' : 'default'}
            helperTextInvalid={tagInFormError}
            fieldId='add-new-tag'
            label='Add new tag'
          >
            <InputGroup>
              <TextInput
                validated={!!tagInFormError ? 'error' : 'default'}
                type='text'
                id='add-new-tag'
                name='add-new-tag'
                value={tagInForm}
                onChange={val => this.setState({ tagInForm: val })}
                isDisabled={!!tagToVerify || verifyingTag || isSaving}
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
                isDisabled={!!tagToVerify || verifyingTag || isSaving}
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
                  disabled={isSaving}
                  icon={<TagIcon />}
                  onClose={isSaving ? undefined : () => this.removeTag(tag)}
                  key={tag}
                >
                  {tag}
                </Label>
              ))}
            </LabelGroup>
          </FormGroup>
          {pendingTasks > 0 && (
            <Alert
              isInline
              variant='info'
              title={<>Waiting for {pendingTasks} task(s) to finish.</>}
            >
              It's safe to close this window. These tasks will finish in the
              background.
            </Alert>
          )}
        </Form>
      </Modal>
    );
  }

  private validateTagName(tag) {
    return tag.match(VALID_TAG_REGEX);
  }

  private handleFailedTag = (tag, error) => {
    console.log(tag);
    console.log(error.response.data);
  };

  private saveTags() {
    const { containerManifest } = this.props;
    const promises = [];

    this.setState({ isSaving: true }, () => {
      ExecutionEnvironmentAPI.get(this.props.repositoryName).then(result => {
        const repository: ContainerRepositoryType = result.data;

        for (const tag of this.state.tagsToRemove) {
          promises.push(
            ContainerTagAPI.untag(
              repository.pulp.repository.pulp_id,
              tag,
              containerManifest.digest,
            ).catch(e => this.handleFailedTag(tag, e)),
          );
        }

        for (const tag of this.state.tagsToAdd) {
          promises.push(
            ContainerTagAPI.tag(
              repository.pulp.repository.pulp_id,
              tag,
              containerManifest.digest,
            ).catch(e => this.handleFailedTag(tag, e)),
          );
        }

        if (promises.length > 0) {
          Promise.all(promises.map(p => p.catch(this.handleFailedTag))).then(
            results => {
              const tasks = [];
              for (const r of results) {
                if (r) {
                  tasks.push(parsePulpIDFromURL(r.data.task));
                }
              }

              this.waitForTasks(tasks);
            },
          );
        } else {
          this.setState({ isSaving: false });
        }
      });
    });
  }

  private waitForTasks(taskUrls) {
    const pending = new Set(taskUrls);

    const queryTasks = () => {
      const promises = [];
      for (const task of Array.from(pending)) {
        promises.push(TaskAPI.get(task as string));
      }

      Promise.all(promises).then(async results => {
        for (const r of results) {
          const status = r.data.state;
          if (
            status === PulpStatus.completed ||
            status === PulpStatus.skipped ||
            status === PulpStatus.failed ||
            status === PulpStatus.canceled
          ) {
            pending.delete(r.data.pulp_id);
          }
        }
        if (pending.size > 0) {
          // wait 5 seconds and then refresn
          this.setState({ pendingTasks: pending.size });
          await new Promise(r => setTimeout(r, 5000));
          queryTasks();
        } else {
          this.setState({ isSaving: false, pendingTasks: 0 }, () =>
            this.props.reloadManifests(),
          );
        }
      });
    };

    this.setState({ pendingTasks: pending.size }, queryTasks);
  }

  private verifyAndAddTag = () => {
    // copy tag to prevent it from changing in the form during verification
    const tag = `${this.state.tagInForm}`;

    this.setState({ verifyingTag: true }, () => this.verifyTag(tag));
  };

  private verifyTag(tag: string) {
    if (!this.validateTagName(tag)) {
      this.setState({
        verifyingTag: false,
        tagInFormError:
          'A tag may contain lowercase and uppercase ASCII ' +
          'alphabetic characters, digits, underscores, periods, and dashes. A tag must not ' +
          'start with a period or a dash.',
      });
    } else {
      this.setState({ tagInFormError: undefined }, () => {
        ExecutionEnvironmentAPI.image(this.props.repositoryName, tag)
          .then(result => {
            this.setState({ tagToVerify: tag, verifyingTag: false });
          })
          .catch(err => {
            this.setState({ tagInForm: '', verifyingTag: false }, () =>
              this.addTag(tag),
            );
          });
      });
    }
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
