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
import { TagIcon } from '@patternfly/react-icons';
import { isEqual, isEmpty, xorWith, cloneDeep } from 'lodash';
import {
  AlertType,
  APISearchTypeAhead,
  ObjectPermissionField,
} from 'src/components';
import {
  ContainerDistributionAPI,
  GroupObjectPermissionType,
  ExecutionEnvironmentNamespaceAPI,
  ExecutionEnvironmentRegistryAPI,
  ExecutionEnvironmentRemoteAPI,
} from 'src/api';
import { Constants } from 'src/constants';

interface IProps {
  name: string;
  namespace: string;
  description: string;
  onSave: (Promise) => void;
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
}

interface IState {
  name: string;
  description: string;
  selectedGroups: GroupObjectPermissionType[];
  originalSelectedGroups: GroupObjectPermissionType[];

  addTagsInclude: string;
  addTagsExclude: string;
  excludeTags?: string[];
  includeTags?: string[];
  registries?: { id: string; name: string }[];
  registrySelection?: { id: string; name: string }[];
  upstreamName: string;
  formErrors?: {
    registries?: AlertType;
    groups?: AlertType;
  };
}

export class RepositoryForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name || '',
      description: this.props.description,
      selectedGroups: [],
      originalSelectedGroups: [],

      addTagsInclude: '',
      addTagsExclude: '',
      excludeTags: this.props.excludeTags,
      includeTags: this.props.includeTags,
      registries: null,
      registrySelection: [],
      upstreamName: this.props.upstreamName || '',
      formErrors: {
        registries: null,
        groups: null,
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
          this.setState({
            formErrors: {
              ...this.state.formErrors,
              registries: {
                title: t`Error loading registries.`,
                description: e?.message,
                variant: 'danger',
              },
            },
          });
        });
    }

    if (!this.props.isNew) {
      this.loadSelectedGroups();
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
            onClick={() => onSave(this.onSave())}
            isDisabled={
              (this.state.name.length === 0 ||
                this.state.upstreamName.length === 0 ||
                this.state.registrySelection.length === 0) &&
              isRemote
            }
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
              >
                <TextInput
                  id='name'
                  value={name}
                  isDisabled={!isNew}
                  onChange={(value) => this.setState({ name: value })}
                />
              </FormGroup>

              <FormGroup
                key='upstreamName'
                fieldId='upstreamName'
                label={t`Upstream name`}
                isRequired={true}
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
                {!!formErrors?.registries ? (
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

              {includeTags.length && excludeTags.length ? (
                <Alert
                  variant='warning'
                  isInline
                  title={t`It does not make sense to include and exclude tags at the same time.`}
                />
              ) : null}
            </>
          )}

          <FormGroup
            key='description'
            fieldId='description'
            label={t`Description`}
          >
            <TextArea
              id='description'
              value={description}
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
          <FormGroup
            key='groups'
            fieldId='groups'
            label={t`Groups with access`}
            className='hub-formgroup-groups'
          >
            {!!formErrors?.groups ? (
              <Alert title={formErrors.groups.title} variant='danger' isInline>
                {formErrors.groups.description}
              </Alert>
            ) : (
              <>
                <div className='pf-c-form__helper-text'>
                  {t`Adding groups provides access to all repositories in the
                    "${namespace}" container namespace.`}
                </div>
                <ObjectPermissionField
                  groups={this.state.selectedGroups}
                  availablePermissions={
                    Constants.CONTAINER_NAMESPACE_PERMISSIONS
                  }
                  setGroups={(g) => this.setState({ selectedGroups: g })}
                  menuAppendTo='parent'
                  isDisabled={
                    !this.props.permissions.includes(
                      'container.change_containernamespace',
                    )
                  }
                  onError={(err) =>
                    this.setState({
                      formErrors: {
                        ...this.state.formErrors,
                        groups: {
                          title: t`Error loading groups.`,
                          description: err,
                          variant: 'danger',
                        },
                      },
                    })
                  }
                ></ObjectPermissionField>
              </>
            )}
          </FormGroup>
        </Form>
      </Modal>
    );
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

  private loadSelectedGroups() {
    const { namespace } = this.props;
    return ExecutionEnvironmentNamespaceAPI.get(namespace)
      .then((result) =>
        this.setState({
          selectedGroups: cloneDeep(result.data.groups),
          originalSelectedGroups: result.data.groups,
        }),
      )
      .catch((e) => {
        this.setState({
          formErrors: {
            ...this.state.formErrors,
            groups: {
              title: t`Error loading groups.`,
              description: e?.message,
              variant: 'danger',
            },
          },
        });
      });
  }

  private addTags(tags, key: 'includeTags' | 'excludeTags') {
    const current = new Set(this.state[key]);
    tags.split(/\s+|\s*,\s*/).forEach((tag) => current.add(tag));

    this.setState({
      [key]: Array.from(current.values()),
      [key === 'includeTags' ? 'addTagsInclude' : 'addTagsExclude']: '',
    } as any);
  }

  private removeTag(tag, key: 'includeTags' | 'excludeTags') {
    const current = new Set(this.state[key]);
    current.delete(tag);

    this.setState({
      [key]: Array.from(current.values()),
    } as any);
  }

  private onSave() {
    const {
      description: originalDescription,
      distributionPulpId,
      isNew,
      isRemote,
      name: originalName,
      namespace,
      remotePulpId,
    } = this.props;
    const {
      description,
      excludeTags: exclude_tags,
      includeTags: include_tags,
      name,
      registrySelection: [{ id: registry } = { id: null }],
      selectedGroups,
      originalSelectedGroups,
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
      // remote edit or local edit - groups, if changed
      !this.compareGroupsAndPerms(
        selectedGroups.sort(),
        originalSelectedGroups.sort(),
      ) &&
        ExecutionEnvironmentNamespaceAPI.update(namespace, {
          groups: selectedGroups,
        }),
    ]);
  }

  //Compare groups and compare their permissions
  private compareGroupsAndPerms(original, newOne) {
    let same = true;
    if (original.length === newOne.length) {
      original.forEach((x, index) => {
        if (
          !isEmpty(
            xorWith(
              x.object_permissions.sort(),
              newOne[index].object_permissions.sort(),
              isEqual,
            ),
          )
        ) {
          same = false;
        }
      });
    }
    return isEmpty(xorWith(original, newOne, isEqual)) && same;
  }
}
