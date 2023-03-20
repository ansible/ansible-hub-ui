import { t } from '@lingui/macro';
import {
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
import * as React from 'react';
import {
  ContainerDistributionAPI,
  ExecutionEnvironmentRegistryAPI,
  ExecutionEnvironmentRemoteAPI,
} from 'src/api';
import {
  APISearchTypeAhead,
  AlertList,
  AlertType,
  HelperText,
  closeAlertMixin,
} from 'src/components';
import {
  ErrorMessagesType,
  alertErrorsWithoutFields,
  chipGroupProps,
  errorMessage,
  isFieldValid,
  isFormValid,
  mapErrorMessages,
} from 'src/utilities';

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
  remoteId?: string;
  addAlert?: (variant, title, description?) => void;
}

interface IState {
  name: string;
  description: string;
  alerts: AlertType[];
  addTagsInclude: string;
  addTagsExclude: string;
  excludeTags?: string[];
  includeTags?: string[];
  registries?: { id: string; name: string }[];
  registrySelection?: { id: string; name: string }[];
  upstreamName: string;
  formErrors: ErrorMessagesType;
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
      formErrors: {},
      alerts: [],
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
          const errorTitle = t`Registries list could not be displayed.`;
          this.addAlert({
            variant: 'danger',
            title: errorTitle,
            description: errorMessage(status, statusText),
          });
          this.setState({
            formErrors: { ...this.state.formErrors, registries: errorTitle },
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
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
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
                helperTextInvalid={this.state.formErrors['name']}
                validated={isFieldValid(this.state.formErrors, 'name')}
              >
                <TextInput
                  id='name'
                  value={name}
                  isDisabled={!isNew}
                  onChange={(value) => {
                    this.setState({ name: value });
                    this.validateName(value);
                  }}
                  validated={isFieldValid(this.state.formErrors, 'name')}
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
                helperTextInvalid={
                  this.state.formErrors['registries'] ||
                  this.state.formErrors['registry']
                }
                validated={isFieldValid(this.state.formErrors, [
                  'registries',
                  'registry',
                ])}
              >
                {!formErrors?.registries && (
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
                            formErrors: { ...formErrors, registry: null },
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
                <LabelGroup
                  {...chipGroupProps()}
                  id='remove-tag'
                  defaultIsOpen={true}
                >
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
                <LabelGroup
                  {...chipGroupProps()}
                  id='remove-tag'
                  defaultIsOpen={true}
                >
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
        </Form>
      </Modal>
    );
  }

  private validateName(name) {
    const regex = /^([0-9A-Za-z._-]+\/)?[0-9A-Za-z._-]+$/;
    if (name === '' || regex.test(name)) {
      this.setState({ formErrors: { ...this.state.formErrors, name: null } });
      return;
    } else {
      const error = t`Container names can only contain alphanumeric characters, ".", "_", "-" and a up to one "/".`;
      this.setState({ formErrors: { ...this.state.formErrors, name: error } });
    }
  }

  private formIsValid() {
    const { name, upstreamName, registrySelection } = this.state;
    if (!this.props.isRemote) {
      // no validation for local
      return true;
    }

    if (!isFormValid(this.state.formErrors)) {
      return false;
    }

    // validation for non empty fields
    return name && upstreamName && registrySelection.length;
  }

  private loadRegistries(name?) {
    return ExecutionEnvironmentRegistryAPI.list({
      ...(name ? { name__icontains: name } : {}),
    }).then(({ data }) => {
      const registries = data.data.map(({ id, name }) => ({ id, name }));
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
      remoteId,
    } = this.props;
    const {
      description,
      excludeTags: exclude_tags,
      includeTags: include_tags,
      name,
      registrySelection: [{ id: registry } = { id: null }],
      upstreamName: upstream_name,
    } = this.state;

    let promise = null;
    if (isRemote && isNew) {
      promise = ExecutionEnvironmentRemoteAPI.create({
        name,
        upstream_name,
        registry,
        include_tags,
        exclude_tags,
      });
    } else {
      promise = Promise.all([
        // remote edit - upstream, tags, registry
        isRemote &&
          !isNew &&
          ExecutionEnvironmentRemoteAPI.update(remoteId, {
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

    return promise.catch((e) => {
      this.setState({ formErrors: mapErrorMessages(e) });
      alertErrorsWithoutFields(
        this.state.formErrors,
        ['name', 'registry', 'registries'],
        (alert) => this.addAlert(alert),
        t`Error when saving registry.`,
        (state) => this.setState({ formErrors: state }),
      );
      return Promise.reject(new Error(e));
    });
  }

  private addAlert(alert) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}
