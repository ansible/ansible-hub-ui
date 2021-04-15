import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { ObjectPermissionField } from 'src/components';
import { GroupObjectPermissionType } from 'src/api';
import { Constants } from 'src/constants';

interface IProps {
  name: string;
  description: string;
  selectedGroups: GroupObjectPermissionType[];
  onSave: (string, []) => void;
  onCancel: () => void;
}

interface IState {
  description: string;
  availableGroups: GroupObjectPermissionType[];
  selectedGroups: GroupObjectPermissionType[];
}

export class RepositoryForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      description: this.props.description,
      availableGroups: [],
      selectedGroups: this.props.selectedGroups,
    };
  }

  render() {
    const { name, onSave, onCancel } = this.props;
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
          <FormGroup
            key='description'
            fieldId='description'
            label='Description'
          >
            <TextInput
              id='description'
              value={description}
              onChange={value => this.setState({ description: value })}
              type='text'
            />
          </FormGroup>
          <FormGroup key='groups' fieldId='groups' label='Groups with access'>
            <ObjectPermissionField
              groups={this.state.selectedGroups}
              availablePermissions={Constants.CONTAINER_NAMESPACE_PERMISSIONS}
              setGroups={g => this.setState({ selectedGroups: g })}
            ></ObjectPermissionField>
          </FormGroup>
        </Form>
      </Modal>
    );
  }
}
