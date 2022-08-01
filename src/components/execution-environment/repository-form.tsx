import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  InputGroup,
  Label,
  LabelGroup,
  Modal,
  Spinner,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, TagIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { AlertType, APISearchTypeAhead, HelperText } from 'src/components';
import {
  ContainerDistributionAPI,
  ExecutionEnvironmentRegistryAPI,
  ExecutionEnvironmentRemoteAPI,
} from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';

interface IProps {
  name: string;
  namespace: string;
  description: string;
  onSave: (Promise, state?: IState) => void;
  onCancel: () => void;
  permissions: string[];
  distributionPulpId: string;

  // remote only
  isNew?: boolean;
  isRemote?: boolean;
  excludeTags?: string[];
  includeTags?: string[];
  registry?: string; // pk
  upstreamName?: string;
  remotePulpId?: string;
  addAlert?: (variant, title, description?) => void;
  formError: { title: string; detail: string }[];
}

interface IState {
  name: string;
  description: string;

  addTagsInclude: string;
  addTagsExclude: string;
  excludeTags?: string[];
  includeTags?: string[];
  registries?: { id: string; name: string }[];
  registrySelection?: { id: string; name: string }[];
  upstreamName: string;
  formErrors?: {
    registries?: AlertType;
  };
}

export class RepositoryForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name || '',
      description: this.props.description,

      addTagsInclude: '',
      addTagsExclude: '',
      excludeTags: this.props.excludeTags,
      includeTags: this.props.includeTags,
      registries: null,
      registrySelection: [],
      upstreamName: this.props.upstreamName || '',
      formErrors: {
        registries: null,
      },
    };
  }

  componentDidMount() {
    if (this.props.isRemote) {
      this.loadRegistries()
        .then(() => {
          // prefill registry if passed from props
          if (this.props.registry) {
            this.setState({
              registrySelection: this.state.registries.filter(
                ({ id }) => id === this.props.registry,
              ),
            });
          }
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            formErrors: {
              ...this.state.formErrors,
              registries: {
                title: t`Registries list could not be displayed.`,
                description: errorMessage(status, statusText),
                variant: 'danger',
              },
            },
          });
        });
    }
  }

  render() {
    const { onSave, onCancel, namespace, isNew, isRemote } = this.props;
    const {
      name,
      description,
      upstreamName,
      excludeTags,
      includeTags,
      registrySelection,
      registries,
      addTagsInclude,
      addTagsExclude,
      formErrors,
    } = this.state;

    return (
      <Modal
        variant='large'
        onClose={onCancel}
        isOpen={true}
        title={
          isNew ? t`Add execution environment` : t`Edit execution environment`
        }
        actions={[
          <Button
            key='save'
            variant='primary'
            isDisabled={!this.formIsValid()}
            onClick={() => onSave(this.onSave(), this.state)}
          >
            {t`Save`}
          </Button>,
          <Button key='cancel' variant='link' onClick={onCancel}>
            {t`Cancel`}
          </Button>,
        ]}
      >
        <Form>
          {!isRemote ? (
            <>
              <FormGroup key='name' fieldId='name' label={t`Name`}>
                <TextInput
                  id='name'
                  value={name}
                  isDisabled={true}
                  type='text'
                />
              </FormGroup>

              <FormGroup
                key='namespace'
                fieldId='namespace'
                label={t`Container namespace`}
              >
                <TextInput
                  id='namespace'
                  value={namespace}
                  isDisabled={true}
                  type='text'
                />
              </FormGroup>
            </>
          ) : (
            <>
              <FormGroup
                isRequired={true}
                key='name'
                fieldId='name'
                label={t`Name`}
                helperTextInvalid={t`Container names can only contain alphanumeric characters, ".", "_", "-" and a up to one "/".`}
                validated={this.validateName(name)}
              >
                <TextInput
                  id='name'
                  value={name}
                  isDisabled={!isNew}
                  onChange={(value) => this.setState({ name: value })}
                  validated={this.validateName(name)}
                />
              </FormGroup>

              <FormGroup
                key='upstreamName'
                fieldId='upstreamName'
                label={t`Upstream name`}
                isRequired={true}
                labelIcon={
                  <HelperText
                    content={t`Use the namespace/name format for namespaced containers. Otherwise, use the library/name format.`}
                  />
                }
              >
                <TextInput
                  id='upstreamName'
                  value={upstreamName}
                  onChange={(value) => this.setState({ upstreamName: value })}
                />
              </FormGroup>

              <FormGroup
                key='registry'
                fieldId='registry'
                label={t`Registry`}
                className='hub-formgroup-registry'
                isRequired={true}
              >
                {formErrors?.registries ? (
                  <Alert
                    title={formErrors.registries.title}
                    variant='danger'
                    isInline
                  >
                    {formErrors.registries.description}
                  </Alert>
                ) : (
                  <>
                    {registries ? (
                      <APISearchTypeAhead
                        loadResults={(name) => this.loadRegistries(name)}
                        onClear={() => this.setState({ registrySelection: [] })}
                        onSelect={(event, value) =>
                          this.setState({
                            registrySelection: registries.filter(
                              ({ name }) => name === value,
                            ),
                          })
                        }
                        placeholderText={t`Select a registry`}
                        results={registries}
                        selections={registrySelection}
                      />
                    ) : (
                      <Spinner />
                    )}
                  </>
                )}
              </FormGroup>

              <FormGroup
                fieldId='addTagsInclude'
                label={t`Add tag(s) to include`}
              >
                <InputGroup>
                  <TextInput
                    type='text'
                    id='addTagsInclude'
                    value={addTagsInclude}
                    onChange={(val) => this.setState({ addTagsInclude: val })}
                    onKeyUp={(e) => {
                      // l10n: don't translate
                      if (e.key === 'Enter') {
                        this.addTags(addTagsInclude, 'includeTags');
                      }
                    }}
                  />
                  <Button
                    variant='secondary'
                    onClick={() => this.addTags(addTagsInclude, 'includeTags')}
                  >
                    {t`Add`}
                  </Button>
                </InputGroup>
              </FormGroup>

              <FormGroup
                fieldId='currentTag'
                label={t`Currently included tags`}
              >
                <LabelGroup id='remove-tag' defaultIsOpen={true}>
                  {includeTags.map((tag) => (
                    <Label
                      icon={<TagIcon />}
                      onClose={() => this.removeTag(tag, 'includeTags')}
                      key={tag}
                    >
                      {tag}
                    </Label>
                  ))}
                </LabelGroup>
              </FormGroup>

              <FormGroup
                fieldId='addTagsExclude'
                label={t`Add tag(s) to exclude`}
              >
                <InputGroup>
                  <TextInput
                    type='text'
                    id='addTagsExclude'
                    value={addTagsExclude}
                    onChange={(val) => this.setState({ addTagsExclude: val })}
                    onKeyUp={(e) => {
                      // l10n: don't translate
                      if (e.key === 'Enter') {
                        this.addTags(addTagsExclude, 'excludeTags');
                      }
                    }}
                  />
                  <Button
                    variant='secondary'
                    onClick={() => this.addTags(addTagsExclude, 'excludeTags')}
                  >
                    {t`Add`}
                  </Button>
                </InputGroup>
              </FormGroup>

              <FormGroup
                fieldId='currentTag'
                label={t`Currently excluded tags`}
              >
                <LabelGroup id='remove-tag' defaultIsOpen={true}>
                  {excludeTags.map((tag) => (
                    <Label
                      icon={<TagIcon />}
                      onClose={() => this.removeTag(tag, 'excludeTags')}
                      key={tag}
                    >
                      {tag}
                    </Label>
                  ))}
                </LabelGroup>
              </FormGroup>
            </>
          )}

          <FormGroup
            key='description'
            fieldId='description'
            label={t`Description`}
          >
            <TextArea
              id='description'
              value={description || ''}
              isDisabled={
                !this.props.permissions.includes(
                  'container.namespace_change_containerdistribution',
                )
              }
              onChange={(value) => this.setState({ description: value })}
              type='text'
              resizeOrientation={'vertical'}
              autoResize={true}
            />
          </FormGroup>

          <FormGroup fieldId='none' label={t`Groups with access`}>
            <Alert
              isInline
              variant='info'
              title={
                isNew ? (
                  <Trans>
                    Moved to the <b>Owners</b> tab
                  </Trans>
                ) : (
                  <Trans>
                    Moved to the{' '}
                    <Link
                      target='_blank'
                      to={formatPath(Paths.executionEnvironmentDetailOwners, {
                        container: name,
                      })}
                    >
                      Owners
                    </Link>{' '}
                    <ExternalLinkAltIcon /> tab
                  </Trans>
                )
              }
            />
          </FormGroup>
        </Form>
      </Modal>
    );
  }

  private validateName(name) {
    const regex = /^([0-9A-Za-z._-]+\/)?[0-9A-Za-z._-]+$/;
    if (name === '' || regex.test(name)) {
      return 'default';
    } else {
      return 'error';
    }
  }

  private formIsValid() {
    const { name, upstreamName, registrySelection } = this.state;
    if (!this.props.isRemote) {
      // no validation for local
      return true;
    }
    const nameValid = name && this.validateName(name) === 'default';
    return nameValid && upstreamName && registrySelection.length;
  }

  private loadRegistries(name?) {
    return ExecutionEnvironmentRegistryAPI.list({
      ...(name ? { name__icontains: name } : {}),
    }).then(({ data }) => {
      const registries = data.data.map(({ pk, name }) => ({ id: pk, name }));
      this.setState({ registries });
      return registries;
    });
  }

  private addTags(tags, key: 'includeTags' | 'excludeTags') {
    const current = new Set(this.state[key]);
    tags.split(/\s+|\s*,\s*/).forEach((tag) => current.add(tag));

    this.setState({
      [key]: Array.from(current.values()),
      [key === 'includeTags' ? 'addTagsInclude' : 'addTagsExclude']: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  private removeTag(tag, key: 'includeTags' | 'excludeTags') {
    const current = new Set(this.state[key]);
    current.delete(tag);

    this.setState({
      [key]: Array.from(current.values()),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  private onSave() {
    const {
      description: originalDescription,
      distributionPulpId,
      isNew,
      isRemote,
      name: originalName,
      remotePulpId,
    } = this.props;
    const {
      description,
      excludeTags: exclude_tags,
      includeTags: include_tags,
      name,
      registrySelection: [{ id: registry } = { id: null }],
      upstreamName: upstream_name,
    } = this.state;

    if (isRemote && isNew) {
      return ExecutionEnvironmentRemoteAPI.create({
        name,
        upstream_name,
        registry,
        include_tags,
        exclude_tags,
      });
    }

    return Promise.all([
      // remote edit - upstream, tags, registry
      isRemote &&
        !isNew &&
        ExecutionEnvironmentRemoteAPI.update(remotePulpId, {
          name: originalName, // readonly but required
          upstream_name,
          registry,
          include_tags,
          exclude_tags,
        }),
      // remote edit or local edit - description, if changed
      description !== originalDescription &&
        ContainerDistributionAPI.patch(distributionPulpId, { description }),
    ]);
  }
}
