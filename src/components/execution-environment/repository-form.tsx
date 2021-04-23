import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  TextInput,
} from '@patternfly/react-core';
import { ObjectPermissionField } from 'src/components';
import { GroupObjectPermissionType } from 'src/api';
import { Constants } from 'src/constants';

interface IProps {
  name: string;
  namespace: string;
  description: string;
  selectedGroups: GroupObjectPermissionType[];
  onSave: (string, []) => void;
  onCancel: () => void;
  permissions: string[];
}

interface IState {
  description: string;
  selectedGroups: GroupObjectPermissionType[];
}

export class RepositoryForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      description: this.props.description,
      selectedGroups: this.props.selectedGroups,
    };
  }

  render() {
    const { name, onSave, onCancel, namespace } = this.props;
    const { description, selectedGroups } = this.state;
    return (
      <Modal
        variant='large'
        onClose={onCancel}
        isOpen={true}
        title={'Edit repository'}
        actions={[
          <Button
            key='save'
            variant='primary'
            onClick={() => onSave(description, selectedGroups)}
          >
            Save
          </Button>,
          <Button key='cancel' variant='link' onClick={onCancel}>
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup key='name' fieldId='name' label='Name'>
            <TextInput id='name' value={name} isDisabled={true} type='text' />
          </FormGroup>
          <FormGroup key='name' fieldId='name' label='Container namespace'>
            <TextInput
              id='name'
              value={namespace}
              isDisabled={true}
              type='text'
            />
          </FormGroup>
          <FormGroup
            key='description'
            fieldId='description'
            label='Description'
          >
            <TextInput
              id='description'
              value={description}
              isDisabled={
                !this.props.permissions.includes(
                  'container.namespace_change_containerdistribution',
                )
              }
              onChange={value => this.setState({ description: value })}
              type='text'
            />
          </FormGroup>
          <FormGroup key='groups' fieldId='groups' label='Groups with access'>
            <div className='pf-c-form__helper-text'>
              Adding groups provides access to all repositories in the "
              {namespace}" container namespace.
            </div>
            <ObjectPermissionField
              groups={this.state.selectedGroups}
              availablePermissions={Constants.CONTAINER_NAMESPACE_PERMISSIONS}
              setGroups={g => this.setState({ selectedGroups: g })}
              menuAppendTo='parent'
              isDisabled={
                !this.props.permissions.includes(
                  'container.change_containernamespace',
                )
              }
            ></ObjectPermissionField>
          </FormGroup>
        </Form>
      </Modal>
    );
  }
}
