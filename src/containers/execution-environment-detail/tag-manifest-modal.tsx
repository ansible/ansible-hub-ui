import { t, Trans } from '@lingui/macro';
import * as React from 'react';

import { AlertType } from 'src/components';

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
  pendingTasks: number;
  tagInFormError: string;
}

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  containerManifest: ContainerManifestType;
  reloadManifests: () => void;
  repositoryName: string;
  onAlert: (alert: AlertType) => void;
  containerRepository: ContainerRepositoryType;
}

interface ITaskUrls {
  tag: string;
  task: string;
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
      tagInFormError: undefined,
      pendingTasks: 0,
    };
  }

  componentDidUpdate(prevProps: IProps) {
    // if the containtainer manifest changes, reset the state

    if (this.props.containerManifest !== prevProps.containerManifest) {
      // Don't reset pending tasks and isSaving. This will prevent the user from
      // editing another image while one is already being updated
      this.setState({
        tagsToAdd: [],
        tagsToRemove: [],
        tagInForm: '',
        verifyingTag: false,
        tagToVerify: '',
        tagInFormError: undefined,
      });
    }
  }

  render() {
    const { closeModal, isOpen, containerManifest } = this.props;

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
            {t`Save`}
            {isSaving && <Spinner size='sm'></Spinner>}
          </Button>,
          <Button
            isDisabled={isSaving}
            key='cancel'
            onClick={() => closeModal()}
            variant='link'
          >
            {t`Cancel`}
          </Button>,
        ]}
        isOpen={isOpen}
        onClose={() => closeModal()}
        title={t`Manage tags`}
        variant='small'
      >
        {/*
        The Form component will reload the page when it's "submitted" which causes the page
        to reload when the user hits "enter" or clicks "Show Less" on the LabelGroup
        */}
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormGroup
            validated={tagInFormError ? 'error' : 'default'}
            helperTextInvalid={tagInFormError}
            fieldId='add-new-tag'
            label={t`Add new tag`}
          >
            <InputGroup>
              <TextInput
                validated={tagInFormError ? 'error' : 'default'}
                type='text'
                id='add-new-tag'
                value={tagInForm}
                onChange={(val) => this.setState({ tagInForm: val })}
                isDisabled={!!tagToVerify || verifyingTag || isSaving}
                onKeyUp={(e) => {
                  // l10n: don't translate
                  if (e.key === 'Enter') {
                    this.verifyAndAddTag();
                  }
                }}
              />
              <Button
                aria-label={t`Add new tag to image`}
                variant='secondary'
                onClick={this.verifyAndAddTag}
                isDisabled={!!tagToVerify || verifyingTag || isSaving}
              >
                {t`Add`} {verifyingTag && <Spinner size='sm'></Spinner>}
              </Button>
            </InputGroup>
          </FormGroup>
          {tagToVerify && (
            <Alert
              variant='warning'
              isInline
              title={t`This tag already exists on another image. Do you want to move it to this image?`}
              actionLinks={
                <>
                  <AlertActionLink
                    onClick={() =>
                      this.setState({ tagToVerify: '', tagInForm: '' }, () =>
                        this.addTag(tagToVerify),
                      )
                    }
                  >
                    {t`Yes`}
                  </AlertActionLink>
                  <AlertActionLink
                    onClick={() => this.setState({ tagToVerify: '' })}
                  >
                    {t`No`}
                  </AlertActionLink>
                </>
              }
            />
          )}

          <FormGroup fieldId='remove-tag' label={t`Current tags`}>
            <LabelGroup id='remove-tag' defaultIsOpen={true}>
              {this.getCurrentTags().map((tag) => (
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
              title={
                <Trans>Waiting for {pendingTasks} task(s) to finish.</Trans>
              }
            >
              <Trans>
                It&apos;s safe to close this window. These tasks will finish in
                the background.
              </Trans>
            </Alert>
          )}
        </Form>
      </Modal>
    );
  }

  private validateTagName(tag) {
    return tag.match(VALID_TAG_REGEX);
  }

  private handleFailedTag = (tag, error, operation) => {
    let msg = undefined;

    if (error.response.data['tag']) {
      msg = error.response.data.tag.join(' ');
    }

    if (error.response.data['detail']) {
      msg = error.response.data['detail'];
    }

    this.props.onAlert({
      variant: 'danger',
      title: t`Failed to ${operation} tag "${tag}".`,
      description: msg,
    });
  };

  private saveTags() {
    const { containerManifest } = this.props;

    this.setState({ isSaving: true }, () => {
      const repository: ContainerRepositoryType =
        this.props.containerRepository;

      const promises = [];

      for (const tag of this.state.tagsToRemove) {
        promises.push({
          tag: tag,
          promise: ContainerTagAPI.untag(
            repository.pulp.repository.pulp_id,
            tag,
            containerManifest.digest,
          ).catch((e) => this.handleFailedTag(tag, e, 'remove')),
        });
      }

      for (const tag of this.state.tagsToAdd) {
        promises.push({
          tag: tag,
          promise: ContainerTagAPI.tag(
            repository.pulp.repository.pulp_id,
            tag,
            containerManifest.digest,
          ).catch((e) => this.handleFailedTag(tag, e, 'add')),
        });
      }

      if (promises.length > 0) {
        Promise.all(promises.map((p) => p.promise)).then((results) => {
          const tasks: ITaskUrls[] = [];
          for (const r in results) {
            if (results[r]) {
              tasks.push({
                tag: promises[r].tag,
                task: parsePulpIDFromURL(results[r].data.task),
              });
            }
          }

          this.waitForTasks(tasks);
        });
      } else {
        this.setState({ isSaving: false });
      }
    });
  }

  // FIXME merge with waitForTask from utilities
  private waitForTasks(taskUrls: ITaskUrls[]) {
    const pending = new Set(taskUrls.map((i) => i.task));

    const queryTasks = () => {
      const promises = [];
      for (const task of Array.from(pending)) {
        promises.push(TaskAPI.get(task as string));
      }

      Promise.all(promises).then(async (results) => {
        for (const r of results) {
          const status = r.data.state;
          if (
            status === PulpStatus.completed ||
            status === PulpStatus.skipped ||
            status === PulpStatus.failed ||
            status === PulpStatus.canceled
          ) {
            pending.delete(r.data.pulp_id);

            if (
              status === PulpStatus.skipped ||
              status === PulpStatus.failed ||
              status === PulpStatus.canceled
            ) {
              const tag = taskUrls.find((e) => e.task === r.data.pulp_id);
              this.props.onAlert({
                variant: 'danger',
                title: t`Task to change tag "${tag.tag}" could not be completed.`,
                description: t`Reason: task ${r.data.state}`,
              });
            }
          }
        }
        if (pending.size > 0) {
          // wait 5 seconds and then refresn
          this.setState({ pendingTasks: pending.size });
          await new Promise((r) => setTimeout(r, 5000));
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
        tagInFormError: t`A tag may contain lowercase and uppercase ASCII alphabetic characters, digits, underscores, periods, and dashes. A tag must not start with a period, underscore, or a dash.`,
      });
    } else if (this.getCurrentTags().includes(tag)) {
      this.setState({
        verifyingTag: false,
        tagInFormError: t`This tag is already selected for this image. You cannot add it twice.`,
      });
    } else {
      this.setState({ tagInFormError: undefined }, () => {
        ExecutionEnvironmentAPI.image(this.props.repositoryName, tag)
          .then(() => {
            this.setState({ tagToVerify: tag, verifyingTag: false });
          })
          .catch(() => {
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
